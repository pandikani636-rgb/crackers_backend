const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;
