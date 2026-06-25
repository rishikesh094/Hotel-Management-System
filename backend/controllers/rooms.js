const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all rooms for a hotel
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
exports.getRoomsByHotel = asyncHandler(async (req, res, next) => {
  const rooms = await Room.find({ hotel: req.params.hotelId });
  res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Manager
exports.createRoom = asyncHandler(async (req, res, next) => {
  const { hotelId, roomType, isAC, price, discount, roomSize, maxGuests, bedType, images, amenities, availableRooms } = req.body;

  // Check if hotel exists and is owned by the manager
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, error: 'Hotel not found' });
  }

  // Authorization check: Must be owner or admin
  if (hotel.manager && hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'You are not authorized to add rooms to this property' });
  }

  const room = await Room.create({
    hotel: hotelId,
    roomType,
    isAC: isAC !== undefined ? isAC : true,
    price,
    discount: discount || 0,
    roomSize: roomSize || '200 sq.ft.',
    maxGuests: maxGuests || 2,
    bedType: bedType || 'Double',
    images: images || [],
    amenities: amenities || ['TV', 'Attached Bathroom'],
    availableRooms: availableRooms !== undefined ? availableRooms : 5
  });

  res.status(201).json({ success: true, data: room });
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Manager
exports.updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }

  const hotel = await Hotel.findById(room.hotel);
  if (hotel.manager && hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized to edit rooms in this hotel' });
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: room });
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Manager
exports.deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }

  const hotel = await Hotel.findById(room.hotel);
  if (hotel.manager && hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized to delete rooms in this hotel' });
  }

  await Room.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
