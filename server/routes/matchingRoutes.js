const express = require('express');
const router = express.Router();
const {
  getRecommendedDonations,
  getRecommendedNGOs
} = require('../controllers/matchingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommended-donations', protect, authorize('ngo', 'admin'), getRecommendedDonations);
router.get('/recommended-ngos', protect, authorize('donor', 'admin'), getRecommendedNGOs);

module.exports = router;
