const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed by this account.',
      });
    }

    // Check if verified purchase: User has a Delivered order containing this product
    const deliveredOrder = await Order.findOne({
      user: req.user.id,
      orderStatus: 'Delivered',
      'items.product': productId,
    });

    const isVerifiedPurchase = !!deliveredOrder;

    const review = await Review.create({
      user: req.user.id,
      userName: req.user.name,
      product: productId,
      rating: Number(rating),
      comment,
      isVerifiedPurchase,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check permission: Admin or review author
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review.',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
