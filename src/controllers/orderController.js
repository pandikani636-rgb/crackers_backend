const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    let subTotal = 0;
    let totalGst = 0;
    const orderItems = [];

    // Calculate totals and check stocks
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const price = product.offerPrice;
      const itemTotal = price * item.quantity;
      const gstAmount = Math.round(itemTotal * (product.gst / 100));

      subTotal += itemTotal;
      totalGst += gstAmount;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: price,
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Process Coupon
    let discountAmount = 0;
    let couponDetails = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate >= new Date()) {
        const potentialDiscount = Math.round(subTotal * (coupon.discountPercentage / 100));
        discountAmount = Math.min(potentialDiscount, coupon.maxDiscount);
        couponDetails = {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          discountAmount: discountAmount,
        };
      }
    }

    // Calculations
    const deliveryCharge = subTotal > 1500 ? 0 : 150; // Free delivery above 1500
    const totalAmount = subTotal + totalGst + deliveryCharge - discountAmount;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      couponUsed: couponDetails,
      gstAmount: totalGst,
      deliveryCharge,
      subTotal,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorize: Admin or order author
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;

    // Manage payment status automatically based on delivery or inputs
    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    // Push into tracking timelines
    order.trackingTimeline.push({
      status,
      timestamp: new Date(),
      description: description || `Your order status updated to: ${status}`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / view printable invoice HTML
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.getOrderInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to download this invoice' });
    }

    // Output raw print-ready HTML page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order._id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); border-radius: 8px; }
          .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff4500; padding-bottom: 20px; }
          .invoice-header h2 { margin: 0; color: #ff4500; }
          .details { margin: 20px 0; display: flex; justify-content: space-between; font-size: 14px; line-height: 20px; }
          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-top: 20px; }
          table th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; padding: 10px; font-weight: bold; }
          table td { padding: 10px; border-bottom: 1px solid #eee; }
          table tr.total td { font-weight: bold; border-top: 2px solid #eee; text-align: right; }
          .total-box { float: right; width: 300px; margin-top: 20px; font-size: 14px; line-height: 24px; }
          .total-row { display: flex; justify-content: space-between; }
          .total-row.final { font-size: 18px; font-weight: bold; color: #ff4500; border-top: 1px solid #ddd; padding-top: 5px; }
          .print-btn { background: #ff4500; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; float: right; margin-bottom: 20px; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print/Download PDF</button>
        <div class="invoice-box">
          <div class="invoice-header">
            <div>
              <h2>SPARKLERS PREMIUM</h2>
              <span>Festival Fireworks Showroom</span>
            </div>
            <div style="text-align: right;">
              <strong>Invoice #:</strong> ${order._id.toString().substring(0, 8).toUpperCase()}<br/>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br/>
              <strong>Status:</strong> ${order.orderStatus}
            </div>
          </div>
          
          <div class="details">
            <div>
              <strong>Billed To:</strong><br/>
              ${order.user.name}<br/>
              ${order.user.email}<br/>
              ${order.user.phone || ''}
            </div>
            <div style="text-align: right;">
              <strong>Shipping Address:</strong><br/>
              ${order.shippingAddress.street}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br/>
              Zip: ${order.shippingAddress.zipCode}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price (INR)</th>
                <th>Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-box">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${order.subTotal}</span>
            </div>
            <div class="total-row">
              <span>GST (incl.):</span>
              <span>₹${order.gstAmount}</span>
            </div>
            <div class="total-row">
              <span>Delivery Charge:</span>
              <span>₹${order.deliveryCharge}</span>
            </div>
            ${order.couponUsed ? `
              <div class="total-row" style="color: green;">
                <span>Discount (${order.couponUsed.code}):</span>
                <span>- ₹${order.couponUsed.discountAmount}</span>
              </div>
            ` : ''}
            <div class="total-row final">
              <span>Total Paid:</span>
              <span>₹${order.totalAmount}</span>
            </div>
          </div>
          <div style="clear: both; margin-top: 40px; text-align: center; font-size: 12px; color: #777;">
            Thank you for celebrating with Sparklers Premium Fireworks!
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    next(error);
  }
};
