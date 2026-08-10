'use strict';

// MIGRATION 4: Create the Appointments table
// An appointment is when a patient books a specific slot with a doctor.
// Status flow: pending → confirmed → completed
//                     → cancelled (by patient or doctor)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Appointments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      patientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      doctorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      slotId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // one appointment per slot
        references: {
          model: 'Slots',
          key: 'id',
        },
      },
      visitType: {
        type: Sequelize.ENUM('clinic', 'home', 'online'),
        defaultValue: 'clinic',
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      reason: {
        // why the patient is visiting (symptoms/reason for visit)
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notesByDoctor: {
        // doctor writes notes after the appointment
        type: Sequelize.TEXT,
        allowNull: true,
      },
      patientAddress: {
        // only needed for home visits
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelledBy: {
        // 'patient' or 'doctor' or 'admin'
        type: Sequelize.STRING,
        allowNull: true,
      },
      cancellationReason: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('Appointments');
  },
};
