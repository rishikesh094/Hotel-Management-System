const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  verifyEmail,
  sendPhoneOtp,
  verifyPhoneOtp
} = require('../controllers/auth');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

// Verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/send-otp', protect, sendPhoneOtp);
router.post('/verify-otp', protect, verifyPhoneOtp);

module.exports = router;
