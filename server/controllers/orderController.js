const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order with server-side price validation & atomic stock decrement
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const rawItems = req.body.items || req.body.orderItems;
    const { shippingAddress, paymentDetails, paymentMethod } = req.body;

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
      });
    }
    const items = rawItems;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping address details.',
      });
    }

    // 1. Authoritative Server-Side Validation: Fetch unit prices and verify inventory
    let itemsSubtotal = 0;
    const validatedOrderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.title || item.productId} no longer exists.`,
        });
      }

      const qty = parseInt(item.quantity, 10) || 1;

      // Check stock
      if (product.stockCount < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Available: ${product.stockCount}, Requested: ${qty}.`,
        });
      }

      const itemSubtotal = product.refurbishedPrice * qty;
      itemsSubtotal += itemSubtotal;

      validatedOrderItems.push({
        product: product._id,
        title: product.title,
        image: product.primaryImage || (product.images && product.images[0]),
        conditionGrade: product.conditionGrade,
        unitPrice: product.refurbishedPrice,
        quantity: qty,
        subtotal: itemSubtotal,
      });
    }

    // 2. Server-Side Financials
    const shippingFee = itemsSubtotal > 999 ? 0 : 99;
    const estimatedTax = Math.round(itemsSubtotal * 0.18);
    const totalPrice = itemsSubtotal + shippingFee;

    // 3. Atomic stock decrements
    for (const item of validatedOrderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stockCount: { $gte: item.quantity } },
        { $inc: { stockCount: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: `Could not reserve stock for "${item.title}". Item may have just sold out.`,
        });
      }
    }

    // 4. Generate Order Number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `RLP-${year}-${randomSuffix}`;

    // 5. Create Order Record
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      orderItems: validatedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone || 'N/A',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || 'Tamil Nadu',
        postalCode: shippingAddress.postalCode || '600001',
        country: shippingAddress.country || 'India',
      },
      pricing: {
        itemsSubtotal,
        shippingFee,
        estimatedTax,
        discountAmount: 0,
        totalPrice,
      },
      paymentDetails: (() => {
        let rawMethod = paymentDetails?.paymentMethod || paymentMethod || 'Simulated Card';
        let method = 'Simulated Card';
        if (rawMethod === 'Cash on Delivery' || rawMethod === 'COD') method = 'Cash on Delivery';
        else if (rawMethod === 'UPI Simulator' || rawMethod === 'UPI') method = 'UPI Simulator';

        const isCod = method === 'Cash on Delivery';
        const isSimulatedPaid = !isCod && paymentDetails?.status !== 'Failed' && paymentDetails?.simulatedSuccess !== false;

        return {
          paymentMethod: method,
          status: isCod ? 'Pending' : (isSimulatedPaid ? 'Paid' : 'Pending'),
          transactionId: isCod
            ? `COD-PENDING-${Date.now().toString(36).toUpperCase()}`
            : `TXN-SIM-${Date.now().toString(36).toUpperCase()}`,
          cardBrand: method === 'UPI Simulator' ? 'UPI' : (paymentDetails?.cardBrand || 'Visa'),
          cardLast4: method === 'UPI Simulator' ? 'UPI' : (paymentDetails?.cardLast4 || '4242'),
          paidAt: isCod ? null : (isSimulatedPaid ? new Date() : null),
        };
      })(),
      orderStatus: 'Order Placed',
      statusTimeline: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          note: (paymentDetails?.paymentMethod === 'Cash on Delivery' || paymentMethod === 'Cash on Delivery' || paymentMethod === 'COD')
            ? 'Order placed via Cash on Delivery. Payment pending collection upon package delivery.'
            : 'Payment authorized via RELOOP Simulated Sandbox.',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = await Order.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { orderNumber: id }],
    }).populate('orderItems.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Verify ownership unless admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('orderItems.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      orders,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order fulfillment status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'Order Placed',
      'Inspected & Packed',
      'Dispatched',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = status;
    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status}`,
    });

    // NOTE: Updating fulfillment status (e.g. to Dispatched or Delivered) strictly preserves
    // the current order.paymentDetails.status and does NOT automatically mark COD as Paid.
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status transitioned to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order payment status (Admin - e.g. COD collection upon doorstep receipt)
// @route   PATCH /api/orders/:id/payment-status
// @access  Private/Admin
const updateOrderPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validPaymentStatuses = ['Paid', 'Pending', 'Failed', 'Refunded'];
    if (!validPaymentStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Valid values: ${validPaymentStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentDetails.status = status;
    if (status === 'Paid') {
      order.paymentDetails.paidAt = new Date();
    }
    order.statusTimeline.push({
      status: `Payment: ${status}`,
      timestamp: new Date(),
      note: note || `Payment status updated to ${status} by administrator.`,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
};
