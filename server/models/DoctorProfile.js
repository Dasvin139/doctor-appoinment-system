module.exports = (sequelize, DataTypes) => {
  const DoctorProfile = sequelize.define(
    'DoctorProfile',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qualification: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      licenseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      consultationFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      visitType: {
        // clinic = patient comes to doctor
        // home = doctor goes to patient's home
        // both = doctor offers both options
        // online = video consultation
        type: DataTypes.ENUM('clinic', 'home', 'both', 'online'),
        defaultValue: 'clinic',
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clinicAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verificationStatus: {
        // pending  = doctor just registered, waiting for admin to review
        // verified = admin approved, doctor can accept patients
        // rejected = admin rejected, doctor cannot appear in listings
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
      },
      rejectionReason: {
        // if rejected, admin writes why
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verifiedBy: {
        // UUID of the admin who verified this doctor
        type: DataTypes.UUID,
        allowNull: true,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      // underscored: false because column names already match (camelCase)
    }
  );

  return DoctorProfile;
};