const express = require('express');
const router = express.Router();
const {
  getMyOrganization,
  updateMyOrganization,
  getOrganizations,
  getOrganizationById,
  updateVerificationStatus
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, getMyOrganization);
router.put('/me', protect, updateMyOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.patch('/:id/verification', protect, authorize('admin'), updateVerificationStatus);

module.exports = router;
