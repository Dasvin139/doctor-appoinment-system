'use strict';

// MIGRATION 2: Create the DoctorProfiles table
// This table stores extra info for users who are doctors.
// It links to Users via userId (foreign key).
// verificationStatus replaces the old boolean isVerified —
// now admin can set: 'pending' | 'verified' | 'rejected'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DoctorProfiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users', // foreign key → links to Users table
          key: 'id',
        },
        onDelete: 'CASCADE', // if user is deleted, their profile is also deleted
      },
      specialization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      qualification: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      licenseNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      experienceYears: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      consultationFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      visitType: {
        // Can the doctor visit home, clinic, or both?
        type: Sequelize.ENUM('clinic', 'home', 'both', 'online'),
        defaultValue: 'clinic',
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profilePhoto: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clinicAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verificationStatus: {
        // pending = waiting for admin review
        // verified = approved, can accept patients
        // rejected = not approved, reason given
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verifiedBy: {
        // which admin approved this doctor
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('DoctorProfiles');
  },
};
