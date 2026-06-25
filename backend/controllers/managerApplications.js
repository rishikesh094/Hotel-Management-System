const ManagerApplication = require('../models/ManagerApplication');
const User = require('../models/User');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/mailer');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit a manager application
// @route   POST /api/manager-applications/apply
// @access  Private
exports.submitApplication = asyncHandler(async (req, res, next) => {
  // Check if user already has an application
  const existing = await ManagerApplication.findOne({ user: req.user.id });
  if (existing && existing.status !== 'Rejected') {
    return next(new ErrorResponse('You already have an active application.', 400));
  }

  // Set user ID and email verification logic
  req.body.user = req.user.id;
  
  // Create or overwrite the application
  let application;
  if (existing && existing.status === 'Rejected') {
    // Re-applying: delete old application and insert new
    await ManagerApplication.findByIdAndDelete(existing._id);
  }
  
  // Set status. If user is already email verified, they can go to Under Review immediately, otherwise Pending
  const isEmailVerified = req.user.isEmailVerified;
  const initialStatus = isEmailVerified ? 'Under Review' : 'Pending';
  
  application = await ManagerApplication.create({
    ...req.body,
    status: initialStatus
  });

  // Create Document collection logs for each uploaded file
  const docFields = [
    { name: 'Profile Photo', path: req.body.documents?.profilePhoto, type: 'profilePhoto' },
    { name: 'Aadhaar Upload', path: req.body.documents?.aadhaarCard, type: 'aadhaarCard' },
    { name: 'PAN Upload', path: req.body.documents?.panCard, type: 'panCard' },
    { name: 'Hotel License', path: req.body.documents?.hotelLicense, type: 'hotelLicense' },
    { name: 'GST Certificate', path: req.body.documents?.gstCertificate, type: 'gstCertificate' },
    { name: 'Business Proof', path: req.body.documents?.businessProof, type: 'businessProof' }
  ];

  for (const doc of docFields) {
    if (doc.path) {
      await Document.create({
        name: doc.name,
        path: doc.path,
        size: 1024 * 102, // Mock 102KB size or custom
        mimetype: doc.path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        uploadedBy: req.user.id,
        linkedTo: application._id,
        onModel: 'ManagerApplication'
      });
    }
  }

  // Add multiple hotel images if present
  if (req.body.hotelImages && Array.isArray(req.body.hotelImages)) {
    for (let i = 0; i < req.body.hotelImages.length; i++) {
      await Document.create({
        name: `Hotel Image ${i + 1}`,
        path: req.body.hotelImages[i],
        size: 1024 * 512, // Mock 512KB
        mimetype: 'image/jpeg',
        uploadedBy: req.user.id,
        linkedTo: application._id,
        onModel: 'ManagerApplication'
      });
    }
  }

  // Create dynamic system notifications
  await Notification.create({
    recipient: req.user.id,
    message: `Your partner application for ${application.businessName} has been submitted! Current status: ${initialStatus}.`,
    type: 'info'
  });

  // Trigger email alert to user
  await sendEmail({
    to: req.user.email,
    subject: 'Manager Application Received - StayLuxe',
    text: `Hello ${req.user.name},\n\nWe have received your request to register ${application.businessName} as a hotel partner.\n\nYour application status is: ${initialStatus}.\n${!isEmailVerified ? '\nPlease click the confirmation link sent to your email to verify your email address. Once verified, our team will review your application.' : '\nOur team is reviewing your documents. We will update you shortly!'}\n\nBest Regards,\nStayLuxe Team`
  });

  res.status(201).json({
    success: true,
    data: application
  });
});

// @desc    Get my application status
// @route   GET /api/manager-applications/status
// @access  Private
exports.getMyApplication = asyncHandler(async (req, res, next) => {
  const application = await ManagerApplication.findOne({ user: req.user.id });
  
  if (!application) {
    return res.status(200).json({ success: true, data: null });
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Get all applications (Admin only)
// @route   GET /api/manager-applications
// @access  Private/Admin
exports.getApplications = asyncHandler(async (req, res, next) => {
  // Basic filtering and querying
  const { status, email, name } = req.query;
  let query = {};
  if (status) {
    query.status = status;
  }

  let applications = await ManagerApplication.find(query)
    .populate('user', 'name email phone isEmailVerified isPhoneVerified status')
    .sort('-createdAt');

  // Filter by name/email in user model if specified
  if (name || email) {
    applications = applications.filter(app => {
      let match = true;
      if (name && app.user) {
        match = match && app.user.name.toLowerCase().includes(name.toLowerCase());
      }
      if (email && app.user) {
        match = match && app.user.email.toLowerCase().includes(email.toLowerCase());
      }
      return match;
    });
  }

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Update application status (Approve/Reject) (Admin only)
// @route   PUT /api/manager-applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  let application = await ManagerApplication.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  application.status = status;
  if (status === 'Rejected') {
    application.rejectionReason = rejectionReason || 'Information provided did not match official registries.';
  } else {
    application.rejectionReason = '';
  }

  await application.save();

  const user = await User.findById(application.user);

  if (status === 'Approved') {
    // Upgrade user role to manager
    if (user) {
      user.role = 'manager';
      await user.save();
    }

    // Add dynamic notifications
    await Notification.create({
      recipient: application.user,
      message: 'Congratulations! Your partner account has been approved. You are now a Hotel Manager!',
      type: 'success',
      link: '/manager'
    });

    // Send email alert
    await sendEmail({
      to: user ? user.email : '',
      subject: 'Partner Application Approved! - StayLuxe',
      text: `Hello ${user ? user.name : 'Partner'},\n\nWe are absolutely thrilled to inform you that your application for ${application.businessName} has been approved!\n\nYour account has been upgraded to "Manager". You can now access your manager console dashboard to add hotels, list rooms, track reservations, and view payouts.\n\nLogin and get started here: http://localhost:5173/login\n\nWelcome on board!\nStayLuxe Admin Team`
    });
  } else if (status === 'Rejected') {
    // Add notifications
    await Notification.create({
      recipient: application.user,
      message: `Your partner application has been rejected. Reason: ${application.rejectionReason}`,
      type: 'error',
      link: '/partner'
    });

    // Send email alert
    await sendEmail({
      to: user ? user.email : '',
      subject: 'Partner Application Rejected - StayLuxe',
      text: `Hello ${user ? user.name : 'Partner'},\n\nThank you for your interest in partnering with StayLuxe.\n\nUnfortunately, our verification team has declined your application for ${application.businessName}.\n\nReason for Rejection: ${application.rejectionReason}\n\nYou may log in to the partner page and click "Re-Apply" to correct any errors and upload valid documents.\n\nBest Regards,\nStayLuxe Compliance Team`
    });
  }

  res.status(200).json({
    success: true,
    data: application
  });
});
