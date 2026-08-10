const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', doctorController.getAllDoctors);           // public
router.get('/:id', doctorController.getDoctorById);         // public
router.put('/me', verifyToken, requireRole(['doctor']), doctorController.updateOwnProfile);

module.exports = router;