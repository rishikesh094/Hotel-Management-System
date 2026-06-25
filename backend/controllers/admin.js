const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ManagerApplication = require('../models/ManagerApplication');
const AdminLog = require('../models/AdminLog');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/mailer');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all manager applications
// @route   GET /api/admin/manager-applications
// @access  Private/Admin
exports.getManagerApplications = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  let query = {};
  if (status) {
    query.status = status;
  }

  const applications = await ManagerApplication.find(query)
    .populate('user', 'name email phone isEmailVerified isPhoneVerified status')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

// @desc    Approve manager application
// @route   PUT /api/admin/manager-applications/:id/approve
// @access  Private/Admin
exports.approveManagerApplication = asyncHandler(async (req, res, next) => {
  let application = await ManagerApplication.findById(req.params.id);
  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  application.status = 'Approved';
  await application.save();

  // Upgrade user to manager
  const user = await User.findById(application.user);
  if (user) {
    user.role = 'manager';
    await user.save();

    // Log admin activity
    await AdminLog.create({
      user: req.user.id,
      action: `Approved Manager Application for ${user.name} (Business: ${application.businessName})`
    });

    // Notify manager in-app
    await Notification.create({
      recipient: user._id,
      message: `Your partner application for ${application.businessName} has been approved! Welcome to StayLuxe.`,
      type: 'success',
      link: '/manager'
    });

    // Notify manager via email
    await sendEmail({
      to: user.email,
      subject: 'StayLuxe Partnership Approved!',
      text: `Hello ${user.name},\n\nWe are pleased to inform you that your application to list ${application.businessName} has been approved!\n\nYour account has been upgraded to a Hotel Manager. You can now access your manager console dashboard to add hotels, manage rooms, track reservations, and view payouts.\n\nLogin here: http://localhost:5173/login\n\nBest Regards,\nStayLuxe Compliance Team`
    });
  }

  res.status(200).json({ success: true, data: application });
});

// @desc    Reject manager application
// @route   PUT /api/admin/manager-applications/:id/reject
// @access  Private/Admin
exports.rejectManagerApplication = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) {
    return next(new ErrorResponse('Please provide a rejection reason', 400));
  }

  let application = await ManagerApplication.findById(req.params.id);
  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  application.status = 'Rejected';
  application.rejectionReason = rejectionReason;
  await application.save();

  const user = await User.findById(application.user);
  if (user) {
    // Log admin activity
    await AdminLog.create({
      user: req.user.id,
      action: `Rejected Manager Application for ${user.name} (Reason: ${rejectionReason})`
    });

    // Notify in-app
    await Notification.create({
      recipient: user._id,
      message: `Your partner application has been rejected. Reason: ${rejectionReason}`,
      type: 'error',
      link: '/partner'
    });

    // Notify via email
    await sendEmail({
      to: user.email,
      subject: 'StayLuxe Partner Application Status Update',
      text: `Hello ${user.name},\n\nThank you for applying to partner with StayLuxe.\n\nUnfortunately, your application for ${application.businessName} has been rejected.\n\nReason: ${rejectionReason}\n\nYou may edit your details and click 'Re-apply' on our Partner Onboarding page to submit again.\n\nBest Regards,\nStayLuxe Compliance Team`
    });
  }

  res.status(200).json({ success: true, data: application });
});

// @desc    Get all hotels waiting for approval
// @route   GET /api/admin/hotels/approval-queue
// @access  Private/Admin
exports.getHotelApprovalQueue = asyncHandler(async (req, res, next) => {
  const hotels = await Hotel.find({ status: 'Pending Approval' }).populate('manager', 'name email');
  res.status(200).json({ success: true, count: hotels.length, data: hotels });
});

// @desc    Approve a hotel property
// @route   PUT /api/admin/hotels/:id/approve
// @access  Private/Admin
exports.approveHotel = asyncHandler(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return next(new ErrorResponse('Hotel not found', 404));
  }

  hotel.status = 'Live';
  await hotel.save();

  // Log admin activity
  await AdminLog.create({
    user: req.user.id,
    action: `Approved Hotel: ${hotel.name}`
  });

  if (hotel.manager) {
    await Notification.create({
      recipient: hotel.manager,
      message: `Congratulations! Your property "${hotel.name}" has been approved and is now Live!`,
      type: 'success',
      link: `/manager`
    });

    const manager = await User.findById(hotel.manager);
    if (manager) {
      await sendEmail({
        to: manager.email,
        subject: `Property "${hotel.name}" is now Live!`,
        text: `Hello ${manager.name},\n\nWe are pleased to inform you that your property "${hotel.name}" has passed our verification and is now LIVE on StayLuxe search rankings.\n\nGuests can now view rooms and make reservations.\n\nBest Regards,\nStayLuxe Catalog team`
      });
    }
  }

  res.status(200).json({ success: true, data: hotel });
});

// @desc    Reject a hotel property
// @route   PUT /api/admin/hotels/:id/reject
// @access  Private/Admin
exports.rejectHotel = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;
  let hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    return next(new ErrorResponse('Hotel not found', 404));
  }

  hotel.status = 'Rejected';
  await hotel.save();

  // Log admin activity
  await AdminLog.create({
    user: req.user.id,
    action: `Rejected Hotel: ${hotel.name} (Reason: ${rejectionReason || 'N/A'})`
  });

  if (hotel.manager) {
    await Notification.create({
      recipient: hotel.manager,
      message: `Your property "${hotel.name}" has been rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
      type: 'error',
      link: `/manager`
    });

    const manager = await User.findById(hotel.manager);
    if (manager) {
      await sendEmail({
        to: manager.email,
        subject: `Property "${hotel.name}" Verification Status`,
        text: `Hello ${manager.name},\n\nUnfortunately, your property listing for "${hotel.name}" has been rejected.\n\nReason: ${rejectionReason || 'Information does not match compliance rules.'}\n\nYou may log in to the Manager Dashboard to update details, photos, or policies and submit again.\n\nBest Regards,\nStayLuxe Compliance Team`
      });
    }
  }

  res.status(200).json({ success: true, data: hotel });
});

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.status = 'suspended';
  await user.save();

  // Log admin activity
  await AdminLog.create({
    user: req.user.id,
    action: `Suspended user: ${user.email}`
  });

  res.status(200).json({ success: true, message: 'User suspended successfully.', data: user });
});

// @desc    Ban user account
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.status = 'banned';
  await user.save();

  // Log admin activity
  await AdminLog.create({
    user: req.user.id,
    action: `Banned user permanently: ${user.email}`
  });

  res.status(200).json({ success: true, message: 'User banned permanently.', data: user });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const totalHotels = await Hotel.countDocuments();
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalBookings = await Booking.countDocuments();
  
  // Revenue logic
  const bookings = await Booking.find({ status: { $ne: 'Cancelled' } });
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  // Fraud alerts
  const fraudAlerts = [
    { id: 1, type: 'suspicious_login', detail: 'Manager account accessed from unexpected geolocation (IP: 198.51.100.42)', severity: 'warning', date: 'Just now' },
    { id: 2, type: 'multiple_cancellations', detail: 'User account #482 triggered 5 cancellations within 30 minutes', severity: 'danger', date: '3 hours ago' },
    { id: 3, type: 'failed_verifications', detail: 'Partner applicant Rajesh Kumar failed Aadhaar matching twice', severity: 'info', date: '1 day ago' }
  ];

  // Reviews queue (limit to 5)
  const reviews = await Review.find().populate('user', 'name').populate('hotel', 'name').limit(5);

  // Mock charts over time (last 6 months)
  const charts = {
    bookings: [45, 78, 112, 94, 138, 204],
    revenue: [150000, 310000, 480000, 410000, 680000, 940000],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  };

  res.status(200).json({
    success: true,
    data: {
      totalHotels,
      totalManagers,
      totalUsers,
      totalBookings,
      totalRevenue,
      fraudAlerts,
      reviews,
      charts
    }
  });
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getActivityLogs = asyncHandler(async (req, res, next) => {
  const logs = await AdminLog.find().populate('user', 'name email').sort('-createdAt').limit(50);
  res.status(200).json({ success: true, count: logs.length, data: logs });
});
