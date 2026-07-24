const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please select rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please provide comment text'],
  },
  isApproved: {
    type: Boolean,
    default: true, // For immediate demo availability, can be set false if strict review moderation is toggled
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Static method to get avg rating of product
ReviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        numReviews: obj[0].numberOfReviews
      });
    } else {
      await this.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
