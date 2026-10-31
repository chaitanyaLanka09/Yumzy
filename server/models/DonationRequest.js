const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const donationRequestSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Please provide requested quantity'],
      min: [1, 'Requested quantity must be at least 1']
    },
    unit: {
      type: String,
      default: 'Meals'
    },
    pickupTime: {
      type: Date,
      required: [true, 'Please provide estimated pickup time']
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'COMPLETED',
        'EXPIRED'
      ],
      default: 'PENDING'
    },
    pickupCode: {
      type: String,
      unique: true,
      sparse: true
    },
    donorPickupConfirmed: {
      type: Boolean,
      default: false
    },
    ngoPickupConfirmed: {
      type: Boolean,
      default: false
    },
    history: [historySchema]
  },
  {
    timestamps: true
  }
);

donationRequestSchema.index({ donationId: 1, ngoId: 1 });
donationRequestSchema.index({ donorId: 1, status: 1 });
donationRequestSchema.index({ ngoId: 1, status: 1 });

const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);
module.exports = DonationRequest;
