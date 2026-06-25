const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
  },
  state: {
    type: String,
    required: [true, 'Please add a state'],
  },
  pincode: {
    type: String,
    required: [true, 'Please add a pincode'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  landmark: {
    type: String,
    default: ''
  },
  distanceFromLandmark: {
    type: Number, // in km
    default: 0
  },
  images: {
    type: [String], // Array of image URLs
    validate: [v => v.length >= 1, 'Must have at least one image']
  },
  amenities: {
    type: [String],
  },
  hotelType: {
    type: String,
    enum: ['Luxury', 'Budget', 'Resort', 'Villa', 'Boutique', 'Business'],
    default: 'Budget'
  },
  couplesFriendly: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating can not be more than 5'],
    default: 4.0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  startingPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number, // Percentage
    default: 0
  },
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // True if fully integrated, but we'll leave false for seeded data compatibility
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Live', 'Rejected'],
    default: 'Live' // Default Live for dummy data compatibility
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Hotel', HotelSchema);
