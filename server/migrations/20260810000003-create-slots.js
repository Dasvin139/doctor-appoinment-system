'use strict';

// MIGRATION 3: Create the Slots table
// A slot = one time block a doctor is available.
// Example: Dr. Kumar is available on 2026-08-15 from 10:00 to 10:30 at clinic.
// When a patient books this slot, isAvailable becomes false — no one else can book it.
// This prevents double-booking!

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Slots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      doctorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users', // doctor is a User with role='doctor'
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.DATEONLY, // stores only date, no time (e.g. "2026-08-15")
        allowNull: false,
      },
      startTime: {
        type: Sequelize.TIME, // e.g. "10:00:00"
        allowNull: false,
      },
      endTime: {
        type: Sequelize.TIME, // e.g. "10:30:00"
        allowNull: false,
      },
      visitType: {
        type: Sequelize.ENUM('clinic', 'home', 'online'),
        defaultValue: 'clinic',
      },
      isAvailable: {
        // true = can be booked, false = already booked
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Index for fast lookup: "give me all slots for doctor X on date Y"
    await queryInterface.addIndex('Slots', ['doctorId', 'date']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Slots');
  },
};
