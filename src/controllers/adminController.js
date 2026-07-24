const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard metrics (for charts & counters)
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counters
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Low stock count (stock <= 10)
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 10 } });

    // 2. Revenue summation
    const revenueObj = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueObj.length > 0 ? revenueObj[0].totalSales : 0;

    // 3. Revenue monthly aggregation
    const monthlyStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    // 4. Latest 5 orders with user detail
    const latestOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Popular products listing
    const popularProducts = await Product.find()
      .populate('category', 'name')
      .sort({ rating: -1, numReviews: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        lowStockCount,
        totalRevenue,
        monthlyStats,
        latestOrders,
        popularProducts,
      }
    });
  } catch (error) {
    next(error);
  }
};
