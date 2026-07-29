const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide subcategory name'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide parent category'],
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '/uploads/default-subcategory.png',
  },
}, { timestamps: true });

// Avoid duplicate subcategories under the same parent category
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema);
