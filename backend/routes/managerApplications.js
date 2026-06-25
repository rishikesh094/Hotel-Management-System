const express = require('express');
const {
  submitApplication,
  getMyApplication,
  getApplications,
  updateApplicationStatus
} = require('../controllers/managerApplications');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Customer / User endpoints
router.post('/apply', protect, submitApplication);
router.get('/status', protect, getMyApplication);

// Legacy/Alternative handles
router.post('/', protect, submitApplication);
router.get('/me', protect, getMyApplication);

// Admin controls (supported for super_admin and admin)
router.get('/', protect, authorize('admin', 'super_admin'), getApplications);
router.put('/:id/status', protect, authorize('admin', 'super_admin'), updateApplicationStatus);

module.exports = router;
