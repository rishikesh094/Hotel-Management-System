const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomType: {
    type: String,
    enum: ['Standard', 'Deluxe', 'Suite', 'Family'],
    required: [true, 'Please add a room type']
  },
  isAC: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price per night']
  },
  discount: {
    type: Number,
    default: 0
  },
  roomSize: {
    type: String, // e.g. "150 sq.ft."
    required: true
  },
  maxGuests: {
    type: Number,
    required: true,
    default: 2
  },
  bedType: {
    type: String,
    enum: ['Single', 'Double', 'Queen', 'King'],
    default: 'Double'
  },
  images: {
    type: [String]
  },
  amenities: {
    type: [String],
    default: ['TV', 'Attached Bathroom']
  },
  availableRooms: {
    type: Number,
    required: true,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', RoomSchema);
