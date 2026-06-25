const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// @desc    Get payout history
// @route   GET /api/payouts
router.get('/', protect, authorize('manager', 'admin', 'super_admin'), async (req, res) => {
  try {
    const query = req.user.role === 'manager' ? { payoutTo: req.user.id, type: 'payout' } : { type: 'payout' };
    const payouts = await Transaction.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: payouts.length, data: payouts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Request a payout
// @route   POST /api/payouts/request
router.post('/request', protect, authorize('manager'), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Please specify a valid amount' });
    }

    const payout = await Transaction.create({
      amount,
      type: 'payout',
      status: 'Pending',
      payoutTo: req.user.id
    });

    // Notify admins
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        message: `Payout request of ₹${amount} received from Manager ${req.user.name}`,
        type: 'info',
        link: '/admin'
      });
    }

    res.status(201).json({ success: true, data: payout });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Approve/Release payout (Admin only)
// @route   PUT /api/payouts/:id/release
router.put('/:id/release', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const payout = await Transaction.findById(req.params.id);
    if (!payout || payout.type !== 'payout') {
      return res.status(404).json({ success: false, error: 'Payout request not found' });
    }

    payout.status = 'Completed';
    await payout.save();

    // Log admin activity
    const AdminLog = require('../models/AdminLog');
    await AdminLog.create({
      user: req.user.id,
      action: `Released Payout Transaction ID: ${payout._id} of ₹${payout.amount}`
    });

    // Notify Manager
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: payout.payoutTo,
      message: `Your payout request of ₹${payout.amount} has been processed and released successfully!`,
      type: 'success',
      link: '/manager'
    });

    res.status(200).json({ success: true, data: payout });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
