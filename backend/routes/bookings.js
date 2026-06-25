const express = require('express');
const {
  createBooking,
  getMyBookings,
  getManagerBookings,
  requestCancellation,
  handleCancellation
} = require('../controllers/bookings');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);

// Manager specific endpoints
router.get('/manager', authorize('manager', 'admin', 'super_admin'), getManagerBookings);
router.put('/:id/cancel-handle', authorize('manager', 'admin', 'super_admin'), handleCancellation);

// Customer specific cancel trigger
router.put('/:id/cancel-request', requestCancellation);

module.exports = router;
