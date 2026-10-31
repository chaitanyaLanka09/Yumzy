const express = require('express');
const router = express.Router();
const {
  getDonorAnalytics,
  getNGOAnalytics,
  getAdminAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/donor', protect, authorize('donor', 'admin'), getDonorAnalytics);
router.get('/ngo', protect, authorize('ngo', 'admin'), getNGOAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
