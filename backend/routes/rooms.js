const express = require('express');
const {
  getRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/rooms');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.get('/hotel/:hotelId', getRoomsByHotel);

// Create, Update, Delete are restricted to Managers/Admins
router.post('/', protect, authorize('manager', 'admin', 'super_admin'), createRoom);
router.put('/:id', protect, authorize('manager', 'admin', 'super_admin'), updateRoom);
router.delete('/:id', protect, authorize('manager', 'admin', 'super_admin'), deleteRoom);

module.exports = router;
