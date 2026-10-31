const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yumzy_super_secret_jwt_key_hackathon_2025_secure_random');

      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated. Please contact administrator.'
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}`
      });
    }

    next();
  };
};

const logAction = async (actorId, action, entityType, entityId = null, details = {}) => {
  try {
    await ActivityLog.create({
      actorId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[ActivityLog Error]', err.message);
  }
};

module.exports = {
  protect,
  authorize,
  logAction
};
