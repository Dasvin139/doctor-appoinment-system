// models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);

// Add associations here when you create more models
// db.DoctorProfile = require('./DoctorProfile')(sequelize, Sequelize.DataTypes);
// db.User.hasOne(db.DoctorProfile, { foreignKey: 'userId' });

module.exports = db;