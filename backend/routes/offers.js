const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

// Mock Offers DB Schema (defined in-line or model)
const OfferSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  manager: { type: mongoose.Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);

// @desc    Get all active coupons
// @route   GET /api/offers
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find({ validTo: { $gte: Date.now() } });
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get my offers (Manager only)
// @route   GET /api/offers/my
router.get('/my', protect, authorize('manager', 'admin', 'super_admin'), async (req, res) => {
  try {
    const query = req.user.role === 'manager' ? { manager: req.user.id } : {};
    const offers = await Offer.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Create coupon
// @route   POST /api/offers
router.post('/', protect, authorize('manager', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { code, discountPercent, validFrom, validTo } = req.body;
    
    // Check if code exists
    const exists = await Offer.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    }

    const offer = await Offer.create({
      code: code.toUpperCase(),
      discountPercent,
      validFrom: validFrom || Date.now(),
      validTo: validTo || (Date.now() + 30 * 24 * 60 * 60 * 1000),
      manager: req.user.id
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Delete coupon
// @route   DELETE /api/offers/:id
router.delete('/:id', protect, authorize('manager', 'admin', 'super_admin'), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
    
    if (offer.manager.toString() !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Access Denied' });
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
