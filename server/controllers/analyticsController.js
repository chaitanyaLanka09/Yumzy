const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Helper to convert quantity and unit into estimated kg and meals
// Configurable standard: 1 meal = 0.4 kg
const MEAL_KG_EQUIVALENT = 0.4;

const calculateFoodImpact = (quantity, unit) => {
  const qty = Number(quantity) || 0;
  const u = (unit || '').toLowerCase();

  let weightKg = 0;
  let meals = 0;

  if (u.includes('kg') || u.includes('kilo')) {
    weightKg = qty;
    meals = Math.round(weightKg / MEAL_KG_EQUIVALENT);
  } else if (u.includes('litre') || u.includes('liter')) {
    weightKg = qty; // approx 1L = 1kg
    meals = Math.round(weightKg / MEAL_KG_EQUIVALENT);
  } else if (u.includes('meal') || u.includes('portion') || u.includes('pack') || u.includes('box')) {
    meals = qty;
    weightKg = parseFloat((qty * MEAL_KG_EQUIVALENT).toFixed(1));
  } else {
    meals = qty;
    weightKg = parseFloat((qty * MEAL_KG_EQUIVALENT).toFixed(1));
  }

  return { weightKg, meals };
};

// @desc    Get donor analytics
// @route   GET /api/analytics/donor
// @access  Private/Donor
const getDonorAnalytics = async (req, res, next) => {
  try {
    const donorId = req.user._id;

    // Total donations listed
    const totalListedCount = await Donation.countDocuments({ donorId });
    const activeDonationsCount = await Donation.countDocuments({
      donorId,
      status: { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] }
    });

    // Completed requests for this donor
    const completedRequests = await DonationRequest.find({
      donorId,
      status: 'COMPLETED'
    }).populate('donationId');

    let totalRedistributedMeals = 0;
    let totalRedistributedKg = 0;

    const categoryMap = {};

    completedRequests.forEach((req) => {
      const { weightKg, meals } = calculateFoodImpact(req.requestedQuantity, req.unit);
      totalRedistributedMeals += meals;
      totalRedistributedKg += weightKg;

      const cat = req.donationId?.category || 'Cooked meals';
      categoryMap[cat] = (categoryMap[cat] || 0) + meals;
    });

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }));

    // Pending and accepted requests count
    const pendingRequestsCount = await DonationRequest.countDocuments({ donorId, status: 'PENDING' });
    const acceptedRequestsCount = await DonationRequest.countDocuments({
      donorId,
      status: { $in: ['ACCEPTED', 'READY_FOR_PICKUP'] }
    });

    res.json({
      success: true,
      stats: {
        totalListed: totalListedCount,
        activeListings: activeDonationsCount,
        pendingRequests: pendingRequestsCount,
        acceptedRequests: acceptedRequestsCount,
        completedDonations: completedRequests.length,
        estimatedMealsRedistributed: totalRedistributedMeals,
        estimatedFoodWeightKg: parseFloat(totalRedistributedKg.toFixed(1)),
        co2SavedKg: parseFloat((totalRedistributedKg * 2.5).toFixed(1)) // standard 2.5 kg CO2 per kg food waste avoided
      },
      categoryDistribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get NGO impact analytics
// @route   GET /api/analytics/ngo
// @access  Private/NGO
const getNGOAnalytics = async (req, res, next) => {
  try {
    const ngoId = req.user._id;

    const totalRequestsCount = await DonationRequest.countDocuments({ ngoId });
    const pendingCount = await DonationRequest.countDocuments({ ngoId, status: 'PENDING' });
    const acceptedCount = await DonationRequest.countDocuments({
      ngoId,
      status: { $in: ['ACCEPTED', 'READY_FOR_PICKUP'] }
    });

    // Completed pickups
    const completedRequests = await DonationRequest.find({
      ngoId,
      status: 'COMPLETED'
    }).populate('donationId');

    let totalCollectedMeals = 0;
    let totalCollectedKg = 0;
    const categoryMap = {};

    completedRequests.forEach((req) => {
      const { weightKg, meals } = calculateFoodImpact(req.requestedQuantity, req.unit);
      totalCollectedMeals += meals;
      totalCollectedKg += weightKg;

      const cat = req.donationId?.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + meals;
    });

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }));

    res.json({
      success: true,
      stats: {
        totalRequests: totalRequestsCount,
        pendingRequests: pendingCount,
        acceptedPickups: acceptedCount,
        completedPickups: completedRequests.length,
        mealsCollected: totalCollectedMeals,
        estimatedFoodWeightKg: parseFloat(totalCollectedKg.toFixed(1)),
        estimatedPeopleServed: Math.round(totalCollectedMeals * 0.9)
      },
      categoryDistribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform-wide admin analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const totalDonationsListed = await Donation.countDocuments();
    const activeDonationsCount = await Donation.countDocuments({
      status: { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] }
    });

    const completedRequests = await DonationRequest.find({ status: 'COMPLETED' })
      .populate('donationId')
      .populate('donorId', 'name')
      .populate('ngoId', 'name');

    let totalRedistributedMeals = 0;
    let totalRedistributedKg = 0;
    const donorLeaderboardMap = {};
    const ngoDistributionMap = {};
    const categoryMap = {};

    completedRequests.forEach((req) => {
      const { weightKg, meals } = calculateFoodImpact(req.requestedQuantity, req.unit);
      totalRedistributedMeals += meals;
      totalRedistributedKg += weightKg;

      const donorName = req.donorId?.name || 'Verified Donor';
      donorLeaderboardMap[donorName] = (donorLeaderboardMap[donorName] || 0) + meals;

      const ngoName = req.ngoId?.name || 'Partner NGO';
      ngoDistributionMap[ngoName] = (ngoDistributionMap[ngoName] || 0) + meals;

      const cat = req.donationId?.category || 'Cooked meals';
      categoryMap[cat] = (categoryMap[cat] || 0) + meals;
    });

    // Top donors
    const topDonors = Object.keys(donorLeaderboardMap)
      .map((name) => ({ name, meals: donorLeaderboardMap[name] }))
      .sort((a, b) => b.meals - a.meals)
      .slice(0, 5);

    // Top NGOs
    const topNGOs = Object.keys(ngoDistributionMap)
      .map((name) => ({ name, meals: ngoDistributionMap[name] }))
      .sort((a, b) => b.meals - a.meals)
      .slice(0, 5);

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }));

    // Monthly trends (demo 6 months)
    const monthlyTrends = [
      { month: 'Jun', meals: Math.round(totalRedistributedMeals * 0.12), donations: 12 },
      { month: 'Jul', meals: Math.round(totalRedistributedMeals * 0.16), donations: 18 },
      { month: 'Aug', meals: Math.round(totalRedistributedMeals * 0.18), donations: 22 },
      { month: 'Sep', meals: Math.round(totalRedistributedMeals * 0.22), donations: 28 },
      { month: 'Oct', meals: Math.round(totalRedistributedMeals * 0.32), donations: 36 }
    ];

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalNGOs,
        totalDonationsListed,
        activeDonations: activeDonationsCount,
        completedDonations: completedRequests.length,
        totalRedistributedMeals,
        totalRedistributedKg: parseFloat(totalRedistributedKg.toFixed(1)),
        estimatedCO2AvoidedKg: parseFloat((totalRedistributedKg * 2.5).toFixed(1))
      },
      categoryDistribution,
      topDonors,
      topNGOs,
      monthlyTrends
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonorAnalytics,
  getNGOAnalytics,
  getAdminAnalytics
};
