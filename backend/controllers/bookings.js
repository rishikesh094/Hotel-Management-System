const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { hotelId, roomId, checkInDate, checkOutDate, guestsCount, paymentMethod } = req.body;

  // Check if room and hotel exist
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new ErrorResponse('Hotel not found', 404));
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return next(new ErrorResponse('Room not found', 404));
  }

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (nights <= 0) {
    return next(new ErrorResponse('Invalid dates selected.', 400));
  }

  const totalAmount = room.price * nights;

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    hotel: hotelId,
    room: roomId,
    checkInDate,
    checkOutDate,
    guestsCount: guestsCount || { adults: 1, children: 0 },
    totalAmount,
    paymentMethod: paymentMethod || 'Pay at Hotel',
    status: paymentMethod === 'Online' ? 'Confirmed' : 'Confirmed'
  });

  // Create transaction log
  await Transaction.create({
    booking: booking._id,
    amount: totalAmount,
    type: 'payment',
    status: 'Completed'
  });

  // Notify Manager
  if (hotel.manager) {
    await Notification.create({
      recipient: hotel.manager,
      message: `New booking received for "${hotel.name}" - Total: ₹${totalAmount}`,
      type: 'success',
      link: '/manager'
    });
  }

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('hotel', 'name images city state address rating')
    .populate('room', 'roomType price isAC');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get manager bookings (Bookings of all hotels owned by manager)
// @route   GET /api/bookings/manager
// @access  Private/Manager
exports.getManagerBookings = asyncHandler(async (req, res, next) => {
  // Find all hotels owned by manager
  const hotels = await Hotel.find({ manager: req.user.id });
  const hotelIds = hotels.map(h => h._id);

  const bookings = await Booking.find({ hotel: { $in: hotelIds } })
    .populate('user', 'name email phone')
    .populate('hotel', 'name city')
    .populate('room', 'roomType price')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Request a cancellation (Customer)
// @route   PUT /api/bookings/:id/cancel-request
// @access  Private
exports.requestCancellation = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
  if (!booking) {
    return next(new ErrorResponse('Booking not found', 404));
  }

  if (booking.status === 'Cancelled') {
    return next(new ErrorResponse('Booking is already cancelled', 400));
  }

  booking.status = 'Cancellation Requested';
  await booking.save();

  // Notify Manager
  const hotel = await Hotel.findById(booking.hotel);
  if (hotel && hotel.manager) {
    await Notification.create({
      recipient: hotel.manager,
      message: `Cancellation requested for booking #${booking._id} at "${hotel.name}"`,
      type: 'warning',
      link: '/manager'
    });
  }

  res.status(200).json({ success: true, message: 'Cancellation request submitted.', data: booking });
});

// @desc    Handle cancellation request (Approve/Decline) (Manager)
// @route   PUT /api/bookings/:id/cancel-handle
// @access  Private/Manager
exports.handleCancellation = asyncHandler(async (req, res, next) => {
  const { action } = req.body; // 'approve' or 'decline'
  if (!action) {
    return next(new ErrorResponse('Please specify an action (approve or decline)', 400));
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(new ErrorResponse('Booking not found', 404));
  }

  const hotel = await Hotel.findById(booking.hotel);
  if (hotel.manager && hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to manage bookings for this property', 403));
  }

  if (action === 'approve') {
    booking.status = 'Cancelled';
    await booking.save();

    // Notify customer
    await Notification.create({
      recipient: booking.user,
      message: `Your cancellation request for booking at "${hotel.name}" has been approved.`,
      type: 'success',
      link: '/profile'
    });
  } else {
    booking.status = 'Confirmed';
    await booking.save();

    // Notify customer
    await Notification.create({
      recipient: booking.user,
      message: `Your cancellation request for booking at "${hotel.name}" has been declined. Booking remains active.`,
      type: 'error',
      link: '/profile'
    });
  }

  res.status(200).json({ success: true, data: booking });
});
