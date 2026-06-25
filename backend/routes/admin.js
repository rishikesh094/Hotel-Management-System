const express = require('express');
const {
  getManagerApplications,
  approveManagerApplication,
  rejectManagerApplication,
  getHotelApprovalQueue,
  approveHotel,
  rejectHotel,
  suspendUser,
  banUser,
  getStats,
  getActivityLogs
} = require('../controllers/admin');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication + admin rights
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Manager Applications approvals
router.get('/manager-applications', getManagerApplications);
router.put('/manager-applications/:id/approve', approveManagerApplication);
router.put('/manager-applications/:id/reject', rejectManagerApplication);

// Hotel approvals queue
router.get('/hotels/approval-queue', getHotelApprovalQueue);
router.put('/hotels/:id/approve', approveHotel);
router.put('/hotels/:id/reject', rejectHotel);

// User/Manager moderation
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/ban', banUser);

// Platform stats and audits
router.get('/stats', getStats);
router.get('/logs', getActivityLogs);

module.exports = router;
