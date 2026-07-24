const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Please provide discount percentage'],
    min: 0,
    max: 100,
  },
  maxDiscount: {
    type: Number,
    required: [true, 'Please provide max discount limit'],
    default: 1000,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide coupon expiry date'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);
