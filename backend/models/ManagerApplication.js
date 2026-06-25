const mongoose = require('mongoose');

const ManagerApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business or hotel name']
  },
  aadhaarNumber: {
    type: String,
    required: [true, 'Please add Aadhaar Number']
  },
  panNumber: {
    type: String,
    required: [true, 'Please add PAN Number']
  },
  gstNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Please add business address']
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String
  },
  documents: {
    profilePhoto: String,
    aadhaarCard: String,
    panCard: String,
    hotelLicense: String,
    gstCertificate: String,
    businessProof: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ManagerApplication', ManagerApplicationSchema);
