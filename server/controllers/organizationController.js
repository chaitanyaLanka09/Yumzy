const Organization = require('../models/Organization');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAction } = require('../middleware/auth');

// @desc    Get current user's organization
// @route   GET /api/organizations/me
// @access  Private
const getMyOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization profile not found' });
    }
    res.json({ success: true, organization: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's organization
// @route   PUT /api/organizations/me
// @access  Private
const updateMyOrganization = async (req, res, next) => {
  try {
    const {
      organizationName,
      organizationType,
      description,
      registrationNumber,
      address,
      locality,
      city,
      state,
      postalCode,
      coordinates,
      foodPreferences,
      capacity,
      operatingHours,
      contactInformation
    } = req.body;

    let org = await Organization.findOne({ userId: req.user._id });
    if (!org) {
      org = new Organization({ userId: req.user._id });
    }

    if (organizationName) org.organizationName = organizationName;
    if (organizationType) org.organizationType = organizationType;
    if (description !== undefined) org.description = description;
    if (registrationNumber !== undefined) org.registrationNumber = registrationNumber;
    if (address !== undefined) org.address = address;
    if (locality !== undefined) org.locality = locality;
    if (city !== undefined) org.city = city;
    if (state !== undefined) org.state = state;
    if (postalCode !== undefined) org.postalCode = postalCode;
    if (coordinates) org.coordinates = coordinates;
    if (foodPreferences) org.foodPreferences = foodPreferences;
    if (capacity !== undefined) org.capacity = Number(capacity);
    if (operatingHours !== undefined) org.operatingHours = operatingHours;
    if (contactInformation) org.contactInformation = contactInformation;

    await org.save();
    await logAction(req.user._id, 'UPDATE_ORGANIZATION', 'Organization', org._id);

    res.json({ success: true, organization: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations (filtered by type or search)
// @route   GET /api/organizations
// @access  Public
const getOrganizations = async (req, res, next) => {
  try {
    const { type, city, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type) query.organizationType = type;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Organization.countDocuments(query);
    const orgs = await Organization.find(query)
      .populate('userId', 'name email role phone profileImage')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: orgs.length,
      total,
      organizations: orgs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Public
const getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id).populate('userId', 'name role profileImage');
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, organization: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization verification status (Admin)
// @route   PATCH /api/organizations/:id/verification
// @access  Private/Admin
const updateVerificationStatus = async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    org.verificationStatus = verificationStatus;
    await org.save();

    // Also update User isVerified flag
    await User.findByIdAndUpdate(org.userId, { isVerified: verificationStatus === 'verified' });

    // Send notification to user
    await Notification.create({
      recipientId: org.userId,
      title: `Organization Verification ${verificationStatus === 'verified' ? 'Approved!' : 'Status Updated'}`,
      message: `Your organization verification status has been set to: ${verificationStatus}.`,
      type: 'verification_update'
    });

    await logAction(req.user._id, 'VERIFY_ORGANIZATION', 'Organization', org._id, { verificationStatus });

    res.json({ success: true, organization: org });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrganization,
  updateMyOrganization,
  getOrganizations,
  getOrganizationById,
  updateVerificationStatus
};
