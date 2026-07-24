const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '/uploads/default-category.png',
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
