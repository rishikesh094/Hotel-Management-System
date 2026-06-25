const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all hotels (Public search)
// @route   GET /api/hotels
// @access  Public
exports.getHotels = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'city', 'state', 'amenities', 'minPrice', 'maxPrice', 'hotelType'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Public search must ONLY return Live approved hotels!
  const parsedQuery = JSON.parse(queryStr);
  parsedQuery.status = 'Live';

  // Finding resource
  query = Hotel.find(parsedQuery);

  // Custom Filters
  if (req.query.city) {
    query = query.find({ city: { $regex: req.query.city, $options: 'i' } });
  }
  if (req.query.state) {
    query = query.find({ state: { $regex: req.query.state, $options: 'i' } });
  }
  if (req.query.hotelType) {
    query = query.find({ hotelType: req.query.hotelType });
  }
  if (req.query.amenities) {
    const amenitiesArr = req.query.amenities.split(',');
    query = query.find({ amenities: { $all: amenitiesArr } });
  }
  if (req.query.minPrice || req.query.maxPrice) {
    const min = req.query.minPrice ? parseInt(req.query.minPrice) : 0;
    const max = req.query.maxPrice ? parseInt(req.query.maxPrice) : 1000000;
    query = query.find({ startingPrice: { $gte: min, $lte: max } });
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Hotel.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const hotels = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: hotels.length,
    pagination,
    data: hotels
  });
});

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ success: false, error: 'Hotel not found' });
  }
  
  const rooms = await Room.find({ hotel: hotel._id });

  res.status(200).json({
    success: true,
    data: {
      ...hotel._doc,
      rooms
    }
  });
});

// @desc    Get manager owned hotels
// @route   GET /api/hotels/manager
// @access  Private/Manager
exports.getManagerHotels = asyncHandler(async (req, res, next) => {
  const hotels = await Hotel.find({ manager: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: hotels.length, data: hotels });
});

// @desc    Create hotel property (Draft or Pending Approval)
// @route   POST /api/hotels
// @access  Private/Manager
exports.createHotel = asyncHandler(async (req, res, next) => {
  // Add manager reference to request body
  req.body.manager = req.user.id;

  // Check images count constraint (minimum 15 images recommended, but we validate strictly if they submit to live)
  const status = req.body.status || 'Pending Approval';

  const hotel = await Hotel.create(req.body);

  // Notify admins if pending approval
  if (status === 'Pending Approval') {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        message: `New property approval request for "${hotel.name}" submitted by Manager ${req.user.name}`,
        type: 'info',
        link: '/admin'
      });
    }
  }

  res.status(201).json({ success: true, data: hotel });
});

// @desc    Update hotel property
// @route   PUT /api/hotels/:id
// @access  Private/Manager
exports.updateHotel = asyncHandler(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ success: false, error: 'Hotel not found' });
  }

  // Owner check
  if (hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'You are not authorized to update this hotel property.' });
  }

  const originalStatus = hotel.status;
  const newStatus = req.body.status || originalStatus;

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Notify admins if status changed to Pending Approval
  if (originalStatus !== 'Pending Approval' && newStatus === 'Pending Approval') {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        message: `Property approval request for "${hotel.name}" resubmitted by Manager ${req.user.name}`,
        type: 'info',
        link: '/admin'
      });
    }
  }

  res.status(200).json({ success: true, data: hotel });
});

// @desc    Delete hotel property
// @route   DELETE /api/hotels/:id
// @access  Private/Manager
exports.deleteHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return res.status(404).json({ success: false, error: 'Hotel not found' });
  }

  if (hotel.manager.toString() !== req.user.id && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'You are not authorized to delete this property' });
  }

  // Also delete associated rooms
  await Room.deleteMany({ hotel: hotel._id });
  await Hotel.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
