const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;
