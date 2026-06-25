const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  reply: {
    type: String,
    default: ''
  },
  replyCreatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per hotel
ReviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

// Calculate average rating after saving review
ReviewSchema.statics.getAverageRating = async function(hotelId) {
  const obj = await this.aggregate([
    {
      $match: { hotel: hotelId }
    },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Hotel').findByIdAndUpdate(hotelId, {
      rating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 4.0,
      totalReviews: obj[0] ? obj[0].totalReviews : 0
    });
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.hotel);
});

ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.hotel);
});

module.exports = mongoose.model('Review', ReviewSchema);
