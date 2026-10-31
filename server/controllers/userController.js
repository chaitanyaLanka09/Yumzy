const User = require('../models/User');
const Organization = require('../models/Organization');
const { logAction } = require('../middleware/auth');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const organization = await Organization.findOne({ userId: req.user._id });
    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        organization
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredLanguage, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    await logAction(user._id, 'UPDATE_PROFILE', 'User', user._id, { name, phone });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && ['donor', 'ngo', 'admin'].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Attach organization info
    const usersWithOrg = await Promise.all(
      users.map(async (u) => {
        const org = await Organization.findOne({ userId: u._id });
        return {
          ...u.toJSON(),
          organization: org
        };
      })
    );

    res.json({
      success: true,
      count: usersWithOrg.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users: usersWithOrg
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers
};
