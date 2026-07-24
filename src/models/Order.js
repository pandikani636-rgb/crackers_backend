const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number, // price per item (offerPrice at purchase time)
        required: true,
      },
    },
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true,
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
  },
  couponUsed: {
    code: String,
    discountPercentage: Number,
    discountAmount: { type: Number, default: 0 }
  },
  gstAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    required: true,
    default: 0,
  },
  subTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  trackingTimeline: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      description: String,
    }
  ]
}, { timestamps: true });

// Set dynamic tracking timelines before save
OrderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.trackingTimeline = [{
      status: 'Pending',
      timestamp: new Date(),
      description: 'Your order has been placed and is waiting verification.',
    }];
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
