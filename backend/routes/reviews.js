const express = require('express');
const {
  getHotelReviews,
  addReview,
  replyToReview
} = require('../controllers/reviews');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to view hotel reviews
router.get('/hotel/:hotelId', getHotelReviews);

// Protected routes
router.post('/', protect, addReview);
router.put('/:id/reply', protect, authorize('manager', 'admin', 'super_admin'), replyToReview);

module.exports = router;
