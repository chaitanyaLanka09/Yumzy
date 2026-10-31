const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  resolveReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createReport);
router.get('/', protect, authorize('admin'), getReports);
router.patch('/:id/resolve', protect, authorize('admin'), resolveReport);

module.exports = router;
