const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const { calculateMatchScore } = require('../services/matchingService');

// @desc    Get recommended food donations for current NGO
// @route   GET /api/matching/recommended-donations
// @access  Private/NGO
const getRecommendedDonations = async (req, res, next) => {
  try {
    const ngoOrg = await Organization.findOne({ userId: req.user._id });
    if (!ngoOrg) {
      return res.status(404).json({ success: false, message: 'NGO Organization profile not found' });
    }

    // Find active donations with pickup deadline in the future
    const donations = await Donation.find({
      status: { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] },
      pickupDeadline: { $gte: new Date() },
      availableQuantity: { $gt: 0 }
    })
      .populate('donorId', 'name email phone')
      .populate('organizationId', 'organizationName organizationType verificationStatus');

    // Score each donation
    const recommendations = donations.map((donation) => {
      const { matchScore, reasons, distanceKm } = calculateMatchScore(donation, ngoOrg);
      return {
        donation,
        matchScore,
        reasons,
        distanceKm
      };
    });

    // Sort by match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended NGOs for a specific donation listing
// @route   GET /api/matching/recommended-ngos
// @access  Private/Donor
const getRecommendedNGOs = async (req, res, next) => {
  try {
    const { donationId } = req.query;
    if (!donationId) {
      return res.status(400).json({ success: false, message: 'Please provide donationId' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Get all registered NGOs
    const ngos = await Organization.find({
      organizationType: { $in: ['ngo', 'food_bank', 'shelter', 'charity', 'community_kitchen'] }
    }).populate('userId', 'name email phone isVerified');

    // Score each NGO
    const matches = ngos.map((ngo) => {
      const { matchScore, reasons, distanceKm } = calculateMatchScore(donation, ngo);
      return {
        ngo,
        matchScore,
        reasons,
        distanceKm
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: matches.length,
      matches: matches.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedDonations,
  getRecommendedNGOs
};
