const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    foodName: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: [
        'Vegetarian',
        'Non-vegetarian',
        'Vegan',
        'Bakery',
        'Fruits',
        'Vegetables',
        'Dairy',
        'Packaged food',
        'Cooked meals',
        'Other'
      ],
      required: [true, 'Please provide a food category']
    },
    dietaryType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'halal', 'jain', 'other'],
      default: 'veg'
    },
    image: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide initial quantity'],
      min: [1, 'Quantity must be at least 1']
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative']
    },
    unit: {
      type: String,
      enum: ['Meals', 'Kilograms', 'Litres', 'Packets', 'Boxes', 'Portions'],
      default: 'Meals'
    },
    preparationDateTime: {
      type: Date,
      default: Date.now
    },
    listedAt: {
      type: Date,
      default: Date.now
    },
    useByDateTime: {
      type: Date
    },
    pickupStartTime: {
      type: Date,
      default: Date.now
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Please provide pickup deadline']
    },
    storageInstructions: {
      type: String,
      trim: true,
      default: 'Keep in temperature controlled container / ambient cool area'
    },
    allergenInformation: {
      type: String,
      trim: true,
      default: 'None declared / May contain dairy, gluten or nuts'
    },
    packagingInformation: {
      type: String,
      trim: true,
      default: 'Hygienically packed in food-grade containers'
    },
    pickupLocation: {
      address: { type: String, default: '' },
      locality: { type: String, default: '' },
      city: { type: String, default: 'Hyderabad' },
      state: { type: String, default: 'Telangana' },
      postalCode: { type: String, default: '' },
      landmark: { type: String, default: '' }
    },
    coordinates: {
      lat: { type: Number, default: 17.3850 },
      lng: { type: Number, default: 78.4867 }
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'PARTIALLY_RESERVED',
        'RESERVED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED'
      ],
      default: 'AVAILABLE'
    },
    isReported: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

donationSchema.index({ status: 1, pickupDeadline: 1 });
donationSchema.index({ category: 1 });
donationSchema.index({ donorId: 1 });

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
