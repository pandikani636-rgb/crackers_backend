const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderInvoice,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin'), getAllOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus);
router.route('/:id/invoice').get(protect, getOrderInvoice);

module.exports = router;
