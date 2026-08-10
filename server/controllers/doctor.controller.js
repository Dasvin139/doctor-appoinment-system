const { User, DoctorProfile } = require('../models');

// GET /api/doctors — list all verified doctors (public, for customers to browse)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;

    // 'verificationStatus: verified' means admin has approved this doctor
    const whereClause = { verificationStatus: 'verified' };
    if (specialization) whereClause.specialization = specialization;

    const doctors = await DoctorProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',   // ← must match the alias defined in models/index.js
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/doctors/:id — single doctor profile
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findOne({
      where: { id: req.params.id, verificationStatus: 'verified' },
      include: [
        {
          model: User,
          as: 'user',   // ← must match the alias defined in models/index.js
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/doctors/me — doctor updates own profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ where: { userId: req.user.userId } });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { specialization, qualification, experienceYears, consultationFee, bio } = req.body;

    if (specialization !== undefined) profile.specialization = specialization;
    if (qualification !== undefined) profile.qualification = qualification;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (consultationFee !== undefined) profile.consultationFee = consultationFee;
    if (bio !== undefined) profile.bio = bio;

    await profile.save();

    res.status(200).json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};