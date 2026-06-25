const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reviews for a hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
exports.getHotelReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ hotel: req.params.hotelId })
    .populate('user', 'name profileImage')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Add a review for a hotel
// @route   POST /api/reviews
// @access  Private/User
exports.addReview = asyncHandler(async (req, res, next) => {
  const { hotelId, rating, comment } = req.body;

  // Check if hotel exists
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new ErrorResponse('Hotel not found', 404));
  }

  // Check if user already reviewed
  const existing = await Review.findOne({ hotel: hotelId, user: req.user.id });
  if (existing) {
    return next(new ErrorResponse('You have already submitted a review for this hotel', 400));
  }

  const review = await Review.create({
    hotel: hotelId,
    user: req.user.id,
    rating,
    comment
  });

  // Notify manager if exists
  if (hotel.manager) {
    await Notification.create({
      recipient: hotel.manager,
      message: `Your hotel "${hotel.name}" received a new ${rating}-star review from ${req.user.name}!`,
      type: 'info',
      link: `/manager`
    });
  }

  res.status(201).json({ success: true, data: review });
});

// @desc    Submit reply to review
// @route   PUT /api/reviews/:id/reply
// @access  Private/Manager
exports.replyToReview = asyncHandler(async (req, res, next) => {
  const { reply } = req.body;
  if (!reply) {
    return next(new ErrorResponse('Please provide a reply message', 400));
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  const hotel = await Hotel.findById(review.hotel);
  if (hotel.manager && hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to reply to reviews for this property', 403));
  }

  review.reply = reply;
  review.replyCreatedAt = Date.now();
  await review.save();

  // Notify the user in-app
  await Notification.create({
    recipient: review.user,
    message: `The manager of "${hotel.name}" has replied to your review!`,
    type: 'success',
    link: `/profile`
  });

  res.status(200).json({ success: true, data: review });
});
