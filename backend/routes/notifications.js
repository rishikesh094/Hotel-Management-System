const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .limit(30);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
