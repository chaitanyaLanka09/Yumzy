const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations,
  closeDonation
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('donor', 'admin'), createDonation);
router.get('/', getDonations);
router.get('/my', protect, authorize('donor'), getMyDonations);
router.get('/:id', getDonationById);
router.put('/:id', protect, authorize('donor', 'admin'), updateDonation);
router.delete('/:id', protect, authorize('donor', 'admin'), deleteDonation);
router.patch('/:id/close', protect, authorize('donor', 'admin'), closeDonation);

module.exports = router;
