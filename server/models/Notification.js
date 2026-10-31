const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'request_created',
        'request_accepted',
        'request_rejected',
        'request_cancelled',
        'ready_for_pickup',
        'pickup_confirmed',
        'completed',
        'report_alert',
        'verification_update',
        'system'
      ],
      default: 'system'
    },
    relatedDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
