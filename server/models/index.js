// models/index.js — loads all models and sets up their relationships (associations)

const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false, // set to console.log to see SQL queries
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ── Load all models ──────────────────────────────────────────────────────────
db.User        = require('./User')(sequelize, Sequelize.DataTypes);
db.DoctorProfile = require('./DoctorProfile')(sequelize, Sequelize.DataTypes);
db.Slot        = require('./Slot')(sequelize, Sequelize.DataTypes);
db.Appointment = require('./Appointment')(sequelize, Sequelize.DataTypes);

// ── Associations (relationships between tables) ──────────────────────────────

// One User (doctor) has one DoctorProfile
db.User.hasOne(db.DoctorProfile, { foreignKey: 'userId', as: 'doctorProfile', onDelete: 'CASCADE' });
db.DoctorProfile.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// One User (doctor) has many Slots
db.User.hasMany(db.Slot, { foreignKey: 'doctorId', as: 'slots' });
db.Slot.belongsTo(db.User, { foreignKey: 'doctorId', as: 'doctor' });

// One Slot has at most one Appointment (a slot can only be booked once)
db.Slot.hasOne(db.Appointment, { foreignKey: 'slotId', as: 'appointment' });
db.Appointment.belongsTo(db.Slot, { foreignKey: 'slotId', as: 'slot' });

// A patient (User) has many Appointments
db.User.hasMany(db.Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'patientId', as: 'patient' });

// A doctor (User) has many Appointments
db.User.hasMany(db.Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = db;