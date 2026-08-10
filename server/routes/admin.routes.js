const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// ALL admin routes are protected
// Step 1: verifyToken  → must be logged in
// Step 2: requireRole  → must be super_admin
// If either check fails → request is blocked
// ─────────────────────────────────────────────────────────────────────────────
router.use(verifyToken, requireRole(['super_admin']));

// Doctor verification
router.get('/doctors/pending', adminController.getPendingDoctors);
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:userId/verify', adminController.verifyDoctor);
router.put('/doctors/:userId/reject', adminController.rejectDoctor);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle', adminController.toggleUserStatus);

// Platform analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
