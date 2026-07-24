const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/mailer');
const { getSignupTemplate, getOTPTemplate } = require('../utils/emailTemplates');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-token-key-sparklers-2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user and send OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user (verified by default)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      isVerified: true,
      role: email.includes('@sparklersadmin.com') ? 'admin' : 'customer', // automatic admin hook for easy testing
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please log in.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Validate OTP and Expiry
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update verification status
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Send welcome HTML email with coupon
    try {
      const welcomeHtml = getSignupTemplate(user.name, 'WELCOME10');
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Sparklers Premium Fireworks!',
        html: welcomeHtml,
      });
    } catch (err) {
      console.error('Welcome email failed to send:', err);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Get user and select password explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check verification status
    if (!user.isVerified) {
      // Re-send OTP if they are not verified
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        const emailHtml = getOTPTemplate(otp);
        await sendEmail({
          to: user.email,
          subject: 'Verify Your Sparklers Account',
          html: emailHtml,
        });
        console.log(`[Re-sent OTP to ${user.email}]: ${otp}`);
      } catch (err) {
        console.error('OTP re-send mail failure:', err);
      }

      return res.status(403).json({
        success: false,
        message: 'Account not verified. Verification OTP re-sent to your email.',
        unverified: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name || req.user.name,
      phone: req.body.phone || req.user.phone,
    };

    if (req.body.password) {
      req.user.password = req.body.password;
      await req.user.save();
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/address
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { street, city, state, zipCode, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      isDefault: user.addresses.length === 0 ? true : isDefault,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/address/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    
    // Set first as default if previous default was deleted
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};
