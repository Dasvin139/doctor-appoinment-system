const { User } = require('../models');

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fields anyone can update
    const { firstName, lastName, phone } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    // Block role/email changes here — those need separate admin-controlled flows
    await user.save();

    const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};