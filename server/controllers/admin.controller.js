const { User, DoctorProfile } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/doctors/pending
// Admin sees all doctors waiting for verification
// ─────────────────────────────────────────────────────────────────────────────
exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await DoctorProfile.findAll({
      where: { verificationStatus: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'createdAt'],
        },
      ],
      order: [['createdAt', 'ASC']], // oldest first (been waiting longest)
    });

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      data: pendingDoctors,
    });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/doctors
// Admin sees ALL doctors with any status (pending, verified, rejected)
// Can filter by status: /api/admin/doctors?status=verified
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllDoctors = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    if (status) whereClause.verificationStatus = status;

    const doctors = await DoctorProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/doctors/:userId/verify
// Admin approves a doctor
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyDoctor = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the doctor's profile
    const profile = await DoctorProfile.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Check it's actually pending (can't re-verify an already verified doctor)
    if (profile.verificationStatus === 'verified') {
      return res.status(400).json({ success: false, message: 'Doctor is already verified' });
    }

    // Update verification status
    await profile.update({
      verificationStatus: 'verified',
      verifiedBy: req.user.userId,  // which admin approved
      verifiedAt: new Date(),        // when it was approved
      rejectionReason: null,         // clear any old rejection reason
    });

    res.status(200).json({
      success: true,
      message: `Dr. ${profile.user.firstName} ${profile.user.lastName} has been verified successfully`,
      data: profile,
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/doctors/:userId/reject
// Admin rejects a doctor with a reason
// ─────────────────────────────────────────────────────────────────────────────
exports.rejectDoctor = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Rejection reason is required — doctor needs to know why
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason so the doctor knows what to fix',
      });
    }

    const profile = await DoctorProfile.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    await profile.update({
      verificationStatus: 'rejected',
      rejectionReason: reason,
      verifiedBy: null,
      verifiedAt: null,
    });

    res.status(200).json({
      success: true,
      message: `Dr. ${profile.user.firstName} ${profile.user.lastName} has been rejected`,
      data: profile,
    });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users
// Admin sees all users on the platform
// Can filter by role: /api/admin/users?role=doctor
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const whereClause = {};
    if (role) whereClause.role = role;

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      include: [
        {
          association: 'doctorProfile',
          required: false, // LEFT JOIN — include users even if no doctor profile
          attributes: ['specialization', 'verificationStatus'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id/toggle
// Admin activates or deactivates a user account
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deactivating their own account
    if (user.id === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    // Toggle: if active → deactivate, if inactive → activate
    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus });

    res.status(200).json({
      success: true,
      message: `User account has been ${newStatus ? 'activated' : 'deactivated'}`,
      data: { id: user.id, email: user.email, isActive: newStatus },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/analytics
// Admin sees platform stats at a glance
// ─────────────────────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    // Run all counts at the same time (parallel) for speed
    const [
      totalCustomers,
      totalDoctors,
      pendingVerification,
      verifiedDoctors,
      rejectedDoctors,
    ] = await Promise.all([
      User.count({ where: { role: 'customer' } }),
      User.count({ where: { role: 'doctor' } }),
      DoctorProfile.count({ where: { verificationStatus: 'pending' } }),
      DoctorProfile.count({ where: { verificationStatus: 'verified' } }),
      DoctorProfile.count({ where: { verificationStatus: 'rejected' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalDoctors,
        pendingVerification,
        verifiedDoctors,
        rejectedDoctors,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
