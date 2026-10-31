const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  markReady,
  confirmPickup
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('ngo', 'admin'), createRequest);
router.get('/my', protect, authorize('ngo', 'admin'), getMyRequests);
router.get('/incoming', protect, authorize('donor', 'admin'), getIncomingRequests);
router.get('/:id', protect, getRequestById);
router.patch('/:id/accept', protect, authorize('donor', 'admin'), acceptRequest);
router.patch('/:id/reject', protect, authorize('donor', 'admin'), rejectRequest);
router.patch('/:id/cancel', protect, cancelRequest);
router.patch('/:id/ready', protect, authorize('donor', 'admin'), markReady);
router.patch('/:id/confirm-pickup', protect, confirmPickup);

module.exports = router;
