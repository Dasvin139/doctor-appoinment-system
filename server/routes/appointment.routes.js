const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// ALL appointment routes require login
// ─────────────────────────────────────────────────────────────────────────────

// Patient books a slot → creates an appointment
router.post(
  '/',
  verifyToken,
  requireRole(['customer']),
  appointmentController.bookAppointment
);

// Patient sees all their appointments
router.get(
  '/mine',
  verifyToken,
  requireRole(['customer']),
  appointmentController.getMyAppointments
);

// Doctor sees all appointments booked with them
router.get(
  '/doctor',
  verifyToken,
  requireRole(['doctor']),
  appointmentController.getDoctorAppointments
);

// Get a single appointment (patient or doctor can view their own)
router.get(
  '/:id',
  verifyToken,
  appointmentController.getAppointmentById
);

// Update appointment status (confirm / complete / cancel)
router.put(
  '/:id/status',
  verifyToken,
  appointmentController.updateAppointmentStatus
);

module.exports = router;
