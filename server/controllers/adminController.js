const User = require('../models/User');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const Organization = require('../models/Organization');
const { logAction } = require('../middleware/auth');

// @desc    Admin dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeDonors = await User.countDocuments({ role: 'donor', isActive: true });
    const registeredNGOs = await User.countDocuments({ role: 'ngo' });
    const totalListings = await Donation.countDocuments();
    const activeListings = await Donation.countDocuments({ status: { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] } });
    const pendingRequests = await DonationRequest.countDocuments({ status: 'PENDING' });
    const completedDonations = await DonationRequest.countDocuments({ status: 'COMPLETED' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const pendingVerifications = await Organization.countDocuments({ verificationStatus: 'pending' });

    // Aggregate total completed meals
    const completedList = await DonationRequest.find({ status: 'COMPLETED' });
    let totalMeals = 0;
    completedList.forEach((item) => {
      totalMeals += Number(item.requestedQuantity) || 0;
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeDonors,
        registeredNGOs,
        totalListings,
        activeListings,
        pendingRequests,
        completedDonations,
        pendingReports,
        pendingVerifications,
        estimatedMealsRedistributed: totalMeals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or activate user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Please provide isActive boolean' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account' });
    }

    user.isActive = isActive;
    await user.save();

    await logAction(req.user._id, isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER', 'User', user._id, {
      targetEmail: user.email,
      targetRole: user.role
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs (audit trail)
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, action } = req.query;
    const query = {};
    if (action) query.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations for admin moderation
// @route   GET /api/admin/donations
// @access  Private/Admin
const getAllDonations = async (req, res, next) => {
  try {
    const { status, isReported, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (isReported !== undefined) query.isReported = isReported === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('donorId', 'name email phone')
      .populate('organizationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donation requests for admin monitoring
// @route   GET /api/admin/requests
// @access  Private/Admin
const getAllRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await DonationRequest.countDocuments(query);
    const requests = await DonationRequest.find(query)
      .populate('donationId')
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      requests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  updateUserStatus,
  getActivityLogs,
  getAllDonations,
  getAllRequests
};
