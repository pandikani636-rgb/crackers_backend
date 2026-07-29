const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide category'],
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    default: null,
  },
  brand: {
    type: String,
    required: [true, 'Please provide brand name'],
    default: 'Sparklers Premium',
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  images: [{
    type: String,
    required: true,
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock count'],
    default: 100,
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please provide original price'],
    default: 0,
  },
  discount: {
    type: Number, // Discount percentage (e.g. 10 for 10% off)
    default: 0,
  },
  offerPrice: {
    type: Number,
    default: 0,
  },
  gst: {
    type: Number, // GST percentage (e.g. 18 for 18% GST)
    default: 18,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTopSelling: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Pre-save hook to calculate offerPrice
ProductSchema.pre('save', function (next) {
  if (this.discount > 0) {
    this.offerPrice = Math.round(this.originalPrice * (1 - this.discount / 100));
  } else {
    this.offerPrice = this.originalPrice;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
