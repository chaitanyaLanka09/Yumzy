const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    organizationName: {
      type: String,
      required: [true, 'Please provide organization name'],
      trim: true
    },
    organizationType: {
      type: String,
      enum: [
        'restaurant',
        'hotel',
        'caterer',
        'supermarket',
        'bakery',
        'community_kitchen',
        'ngo',
        'food_bank',
        'shelter',
        'charity',
        'other'
      ],
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    locality: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: 'Hyderabad'
    },
    state: {
      type: String,
      trim: true,
      default: 'Telangana'
    },
    postalCode: {
      type: String,
      trim: true,
      default: ''
    },
    coordinates: {
      lat: { type: Number, default: 17.3850 },
      lng: { type: Number, default: 78.4867 }
    },
    foodPreferences: {
      type: [String],
      default: ['Vegetarian', 'Cooked meals', 'Bakery']
    },
    capacity: {
      type: Number,
      default: 100, // meals per day
      min: 1
    },
    operatingHours: {
      type: String,
      default: '09:00 AM - 08:00 PM'
    },
    contactInformation: {
      contactPerson: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

organizationSchema.index({ locality: 1, city: 1 });
organizationSchema.index({ verificationStatus: 1 });

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;
