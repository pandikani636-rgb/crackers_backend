const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createReview);

router.route('/product/:productId')
  .get(getProductReviews);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
