const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const DonationRequest = require('../models/DonationRequest');
const { logAction } = require('../middleware/auth');

// @desc    Create a new food donation listing
// @route   POST /api/donations
// @access  Private/Donor
const createDonation = async (req, res, next) => {
  try {
    const {
      foodName,
      description,
      category,
      dietaryType,
      image,
      quantity,
      unit,
      preparationDateTime,
      useByDateTime,
      pickupStartTime,
      pickupDeadline,
      storageInstructions,
      allergenInformation,
      packagingInformation,
      pickupLocation,
      coordinates
    } = req.body;

    if (!foodName || !category || !quantity || !pickupDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food name, category, quantity, and pickup deadline'
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Lookup donor's organization
    const org = await Organization.findOne({ userId: req.user._id });

    // Fallback location from organization if not provided
    const finalLocation = pickupLocation?.address
      ? pickupLocation
      : {
          address: org?.address || 'Main Kitchen Premises',
          locality: org?.locality || 'Banjara Hills',
          city: org?.city || 'Hyderabad',
          state: org?.state || 'Telangana',
          postalCode: org?.postalCode || '500034',
          landmark: ''
        };

    const finalCoordinates = coordinates?.lat && coordinates?.lng
      ? coordinates
      : (org?.coordinates || { lat: 17.4156, lng: 78.4357 });

    const donation = await Donation.create({
      donorId: req.user._id,
      organizationId: org?._id,
      foodName,
      description: description || '',
      category,
      dietaryType: dietaryType || 'veg',
      image: image || '',
      quantity: Number(quantity),
      reservedQuantity: 0,
      availableQuantity: Number(quantity),
      unit: unit || 'Meals',
      preparationDateTime: preparationDateTime ? new Date(preparationDateTime) : new Date(),
      useByDateTime: useByDateTime ? new Date(useByDateTime) : null,
      pickupStartTime: pickupStartTime ? new Date(pickupStartTime) : new Date(),
      pickupDeadline: new Date(pickupDeadline),
      storageInstructions: storageInstructions || 'Keep in clean temperature controlled packaging',
      allergenInformation: allergenInformation || 'No known allergens declared',
      packagingInformation: packagingInformation || 'Hygienically packaged in food-grade containers',
      pickupLocation: finalLocation,
      coordinates: finalCoordinates,
      status: 'AVAILABLE'
    });

    await logAction(req.user._id, 'CREATE_DONATION', 'Donation', donation._id, {
      foodName,
      quantity,
      category
    });

    res.status(201).json({
      success: true,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations (Explore / Marketplace)
// @route   GET /api/donations
// @access  Public
const getDonations = async (req, res, next) => {
  try {
    const {
      search,
      category,
      dietaryType,
      status,
      minQuantity,
      locality,
      sortBy = 'recent',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // By default for public marketplace, show AVAILABLE and PARTIALLY_RESERVED
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] };
      // Filter out past deadline
      query.pickupDeadline = { $gte: new Date() };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (dietaryType && dietaryType !== 'all') {
      query.dietaryType = dietaryType;
    }

    if (minQuantity) {
      query.availableQuantity = { $gte: Number(minQuantity) };
    }

    if (locality) {
      query['pickupLocation.locality'] = { $regex: locality, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { foodName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'pickupLocation.locality': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sortBy === 'deadline') {
      sortOption = { pickupDeadline: 1 };
    } else if (sortBy === 'quantity') {
      sortOption = { availableQuantity: -1 };
    } else if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('donorId', 'name email phone')
      .populate('organizationId', 'organizationName organizationType verificationStatus coordinates locality city')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: donations.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Public
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name phone profileImage isVerified')
      .populate('organizationId');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found' });
    }

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update active donation listing
// @route   PUT /api/donations/:id
// @access  Private/Donor
const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this donation' });
    }

    const {
      foodName,
      description,
      category,
      dietaryType,
      image,
      storageInstructions,
      allergenInformation,
      packagingInformation,
      pickupDeadline,
      pickupStartTime,
      pickupLocation
    } = req.body;

    if (foodName) donation.foodName = foodName;
    if (description !== undefined) donation.description = description;
    if (category) donation.category = category;
    if (dietaryType) donation.dietaryType = dietaryType;
    if (image !== undefined) donation.image = image;
    if (storageInstructions !== undefined) donation.storageInstructions = storageInstructions;
    if (allergenInformation !== undefined) donation.allergenInformation = allergenInformation;
    if (packagingInformation !== undefined) donation.packagingInformation = packagingInformation;
    if (pickupDeadline) donation.pickupDeadline = new Date(pickupDeadline);
    if (pickupStartTime) donation.pickupStartTime = new Date(pickupStartTime);
    if (pickupLocation) donation.pickupLocation = pickupLocation;

    await donation.save();
    await logAction(req.user._id, 'UPDATE_DONATION', 'Donation', donation._id);

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate eligible listing
// @route   DELETE /api/donations/:id
// @access  Private/Donor
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this donation' });
    }

    // Check if there are active accepted requests
    const activeRequests = await DonationRequest.countDocuments({
      donationId: donation._id,
      status: { $in: ['ACCEPTED', 'READY_FOR_PICKUP'] }
    });

    if (activeRequests > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete donation with active accepted pickups. Please coordinate or cancel requests first.'
      });
    }

    donation.status = 'CANCELLED';
    await donation.save();

    await logAction(req.user._id, 'CANCEL_DONATION', 'Donation', donation._id);

    res.json({ success: true, message: 'Donation listing cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my
// @access  Private/Donor
const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });

    // Attach request counts
    const donationsWithStats = await Promise.all(
      donations.map(async (d) => {
        const pendingCount = await DonationRequest.countDocuments({ donationId: d._id, status: 'PENDING' });
        const acceptedCount = await DonationRequest.countDocuments({
          donationId: d._id,
          status: { $in: ['ACCEPTED', 'READY_FOR_PICKUP'] }
        });
        const completedCount = await DonationRequest.countDocuments({ donationId: d._id, status: 'COMPLETED' });

        return {
          ...d.toObject(),
          stats: {
            pendingRequests: pendingCount,
            acceptedRequests: acceptedCount,
            completedRequests: completedCount
          }
        };
      })
    );

    res.json({ success: true, donations: donationsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Close active listing manually
// @route   PATCH /api/donations/:id/close
// @access  Private/Donor
const closeDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    donation.status = 'EXPIRED';
    await donation.save();

    await logAction(req.user._id, 'CLOSE_DONATION', 'Donation', donation._id);

    res.json({ success: true, message: 'Donation listing closed', donation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations,
  closeDonation
};
