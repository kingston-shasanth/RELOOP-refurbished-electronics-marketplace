const Product = require('../models/Product');
const Order = require('../models/Order');
const TradeInRequest = require('../models/TradeInRequest');
const User = require('../models/User');

// @desc    Get live dynamic analytics backed strictly by database records
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeListings = await Product.countDocuments({ isActive: true });
    const lowStockCount = await Product.countDocuments({ stockCount: { $lte: 5, $gt: 0 } });
    const outOfStockCount = await Product.countDocuments({ stockCount: { $lte: 0 } });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Order Placed', 'Inspected & Packed'] } });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Dispatched' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // Aggregate total revenue from paid orders vs pending COD orders
    const paidRevenueAgg = await Order.aggregate([
      { $match: { 'paymentDetails.status': 'Paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
    ]);
    const paidRevenue = paidRevenueAgg.length > 0 ? paidRevenueAgg[0].total : 0;

    const pendingCodAgg = await Order.aggregate([
      { $match: { 'paymentDetails.status': 'Pending', 'paymentDetails.paymentMethod': 'Cash on Delivery' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
    ]);
    const pendingCodRevenue = pendingCodAgg.length > 0 ? pendingCodAgg[0].total : 0;
    const totalRevenue = paidRevenue;

    const pendingTradeIns = await TradeInRequest.countDocuments({ status: { $in: ['Submitted', 'Under Lab Inspection'] } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Product.find({ stockCount: { $lte: 5 } })
      .sort({ stockCount: 1 })
      .limit(6);

    res.status(200).json({
      success: true,
      metrics: {
        totalProducts,
        activeListings,
        lowStockCount,
        outOfStockCount,
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue,
        paidRevenue,
        pendingCodRevenue,
        pendingTradeIns,
        totalCustomers,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registered customers list with live order analytics
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { role: 'customer' };

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    const customerData = await Promise.all(
      customers.map(async (cust) => {
        const orders = await Order.find({ user: cust._id }).select('pricing.totalPrice orderStatus createdAt');
        const totalSpent = orders.reduce((acc, curr) => acc + (curr.pricing?.totalPrice || 0), 0);
        const lastOrder = orders.length > 0 ? orders[orders.length - 1].createdAt : null;

        return {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          role: cust.role,
          createdAt: cust.createdAt,
          orderCount: orders.length,
          totalSpent,
          lastOrder,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customerData.length,
      customers: customerData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getCustomers,
};

