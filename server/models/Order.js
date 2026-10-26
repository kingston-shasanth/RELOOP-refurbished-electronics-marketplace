const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
  },
  title: {
    type: String,
    required: [true, 'Product title snapshot is required'],
  },
  image: {
    type: String,
    required: [true, 'Product image snapshot is required'],
  },
  conditionGrade: {
    type: String,
    required: [true, 'Condition grade snapshot is required'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  subtotal: {
    type: Number,
    required: [true, 'Item subtotal is required'],
    min: [0, 'Item subtotal cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },

    shippingAddress: {
      fullName: { type: String, required: [true, 'Recipient full name is required'] },
      phone: { type: String, required: [true, 'Contact phone number is required'] },
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      postalCode: { type: String, required: [true, 'Postal code is required'] },
      country: { type: String, default: 'India' },
    },

    // Strict Server-Side Financials
    pricing: {
      itemsSubtotal: {
        type: Number,
        required: [true, 'Items subtotal is required'],
        min: [0, 'Items subtotal cannot be negative'],
      },
      shippingFee: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Shipping fee cannot be negative'],
      },
      estimatedTax: {
        type: Number,
        required: [true, 'Estimated tax is required'],
        min: [0, 'Tax cannot be negative'],
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
      },
    },

    // Safe Simulated Payment Information (Zero Raw Card Data)
    paymentDetails: {
      paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['Simulated Card', 'UPI Simulator', 'Cash on Delivery'],
      },
      status: {
        type: String,
        required: true,
        enum: ['Paid', 'Pending', 'Failed'],
        default: 'Paid',
      },
      transactionId: {
        type: String,
        required: [true, 'Transaction ID is required'],
      },
      cardBrand: {
        type: String,
        default: 'Visa',
      },
      cardLast4: {
        type: String,
        default: '4242',
      },
      paidAt: {
        type: Date,
        default: Date.now,
      },
    },

    orderStatus: {
      type: String,
      enum: {
        values: [
          'Order Placed',
          'Inspected & Packed',
          'Dispatched',
          'Out for Delivery',
          'Delivered',
          'Cancelled',
        ],
        message: '{VALUE} is not a valid order status',
      },
      default: 'Order Placed',
    },

    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
// unique: true on orderNumber automatically creates unique index { orderNumber: 1 }
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
