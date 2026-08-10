const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slot.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC routes (no login needed)
// ─────────────────────────────────────────────────────────────────────────────

// Customers browse available slots of a specific doctor
// Example: GET /api/slots/doctor/abc-uuid-123?date=2026-08-15
router.get('/doctor/:doctorId', slotController.getDoctorSlots);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED routes — only logged-in DOCTORS
// ─────────────────────────────────────────────────────────────────────────────

// Doctor creates one slot
router.post('/', verifyToken, requireRole(['doctor']), slotController.createSlot);

// Doctor creates many slots at once
router.post('/bulk', verifyToken, requireRole(['doctor']), slotController.createBulkSlots);

// Doctor sees all their own slots
router.get('/my-slots', verifyToken, requireRole(['doctor']), slotController.getMySlots);

// Doctor deletes one of their slots (only if not booked)
router.delete('/:id', verifyToken, requireRole(['doctor']), slotController.deleteSlot);

module.exports = router;
