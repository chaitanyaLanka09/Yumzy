const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { logAction } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'yumzy_super_secret_jwt_key_hackathon_2025_secure_random',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new donor or NGO
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      preferredLanguage,
      organizationName,
      organizationType,
      address,
      locality,
      city,
      state,
      postalCode,
      lat,
      lng,
      foodPreferences,
      capacity
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and role'
      });
    }

    // Never allow public self-registration as admin
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created via public registration'
      });
    }

    if (!['donor', 'ngo'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "donor" or "ngo"'
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone: phone || '',
      preferredLanguage: preferredLanguage || 'en',
      isActive: true,
      isVerified: false
    });

    // Create corresponding organization profile
    const org = await Organization.create({
      userId: user._id,
      organizationName: organizationName || `${name}'s Organization`,
      organizationType: organizationType || (role === 'donor' ? 'restaurant' : 'ngo'),
      address: address || '',
      locality: locality || 'Banjara Hills',
      city: city || 'Hyderabad',
      state: state || 'Telangana',
      postalCode: postalCode || '500034',
      coordinates: {
        lat: Number(lat) || 17.4156,
        lng: Number(lng) || 78.4357
      },
      foodPreferences: Array.isArray(foodPreferences) && foodPreferences.length ? foodPreferences : ['Vegetarian', 'Cooked meals'],
      capacity: Number(capacity) || 100
    });

    const token = generateToken(user._id);

    await logAction(user._id, 'USER_REGISTERED', 'User', user._id, { role, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        isVerified: user.isVerified,
        organization: org
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.'
      });
    }

    const token = generateToken(user._id);
    const org = await Organization.findOne({ userId: user._id });

    await logAction(user._id, 'USER_LOGIN', 'User', user._id, { email: user.email });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        isVerified: user.isVerified,
        organization: org
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user & organization
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
