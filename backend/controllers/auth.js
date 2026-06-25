const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const { generateOtp, sendSms } = require('../utils/sms');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'Email already registered' });
  }

  // Create verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    phone: phone || '',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpires: verificationTokenExpires
  });

  // Send verification email
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
  
  // Fallback frontend verification URL if they want to verify via UI
  const webVerifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Confirm your StayLuxe Email Address',
    text: `Hello ${user.name},\n\nPlease confirm your email address by clicking the link below:\n\n${webVerifyUrl}\n\nIf you are using testing tools directly, hit this API link:\n${verifyUrl}\n\nThank you!\nStayLuxe Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 12px;">
        <h2 style="color: #6366f1; text-align: center;">Confirm Your Email</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for signing up with StayLuxe! To verify your account, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${webVerifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">If the button above does not work, copy and paste this link in your browser: <br>${webVerifyUrl}</p>
        <p style="font-size: 11px; color: #64748b; margin-top: 20px; border-t: 1px solid #334155; padding-top: 10px;">For direct API integration tests: <a href="${verifyUrl}" style="color: #14b8a6;">${verifyUrl}</a></p>
      </div>
    `
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an email and password' });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Check status (suspend, ban)
  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, error: 'Your account has been temporarily suspended. Please contact support.' });
  }
  if (user.status === 'banned') {
    return res.status(403).json({ success: false, error: 'Your account has been permanently banned.' });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Verify email address via token link
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    emailVerificationToken: req.params.token,
    emailVerificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Verification token is invalid or has expired.' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save();

  // Trigger Notification for the verified email
  const Notification = require('../models/Notification');
  await Notification.create({
    recipient: user._id,
    message: 'Your email address has been successfully verified!',
    type: 'success'
  });

  // Check if this user has an application
  const ManagerApplication = require('../models/ManagerApplication');
  const application = await ManagerApplication.findOne({ user: user._id });
  if (application) {
    // If email is verified, application is eligible for review
    application.status = 'Under Review';
    await application.save();
  }

  // Return HTML page response if accessed via browser, otherwise JSON
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.send(`
      <html>
        <body style="background-color: #0f172a; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
          <div style="text-align: center; background-color: rgba(30, 41, 59, 0.7); padding: 40px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h1 style="color: #14b8a6; margin-bottom: 20px;">Email Verified!</h1>
            <p style="color: #94a3b8; font-size: 18px;">Your email has been successfully confirmed.</p>
            <button onclick="window.location.href='http://localhost:5173/'" style="margin-top: 20px; padding: 12px 24px; background-color: #6366f1; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Go to Platform</button>
          </div>
        </body>
      </html>
    `);
  } else {
    res.status(200).json({ success: true, message: 'Email verified successfully.' });
  }
});

// @desc    Send phone verification OTP
// @route   POST /api/auth/send-otp
// @access  Private
exports.sendPhoneOtp = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const otp = generateOtp();
  user.phoneOtp = otp;
  user.phoneOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  await sendSms(user.phone || req.body.phone || 'N/A', `Your StayLuxe phone verification OTP is: ${otp}. Valid for 10 minutes.`);

  res.status(200).json({ success: true, message: 'OTP sent to mobile phone.' });
});

// @desc    Verify phone OTP
// @route   POST /api/auth/verify-otp
// @access  Private
exports.verifyPhoneOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, error: 'Please provide OTP' });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (user.phoneOtp !== otp || user.phoneOtpExpires < Date.now()) {
    return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
  }

  user.isPhoneVerified = true;
  user.phoneOtp = undefined;
  user.phoneOtpExpires = undefined;
  await user.save();

  // Trigger Notification
  const Notification = require('../models/Notification');
  await Notification.create({
    recipient: user._id,
    message: 'Mobile number verified successfully!',
    type: 'success'
  });

  res.status(200).json({ success: true, message: 'Phone number verified successfully.' });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        phone: user.phone,
        status: user.status
      }
    });
};
