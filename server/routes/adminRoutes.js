const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  updateUserStatus,
  getActivityLogs,
  getAllDonations,
  getAllRequests
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.patch('/users/:id/status', updateUserStatus);
router.get('/activity-logs', getActivityLogs);
router.get('/donations', getAllDonations);
router.get('/requests', getAllRequests);

module.exports = router;
