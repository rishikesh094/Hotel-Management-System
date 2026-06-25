const express = require('express');
const {
  getHotels,
  getHotel,
  getManagerHotels,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotels');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotel);

// Manager protected routes
router.get('/manager/all', protect, authorize('manager', 'admin', 'super_admin'), getManagerHotels);
router.post('/', protect, authorize('manager', 'admin', 'super_admin'), createHotel);
router.put('/:id', protect, authorize('manager', 'admin', 'super_admin'), updateHotel);
router.delete('/:id', protect, authorize('manager', 'admin', 'super_admin'), deleteHotel);

module.exports = router;
