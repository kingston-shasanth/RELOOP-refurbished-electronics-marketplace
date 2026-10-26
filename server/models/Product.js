const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Laptops', 'Smartphones', 'Tablets', 'Audio', 'Wearables', 'Gaming', 'Cameras', 'PC Components'],
        message: 'Category must be Laptops, Smartphones, Tablets, Audio, Wearables, Gaming, Cameras, or PC Components',
      },
    },
    subcategory: {
      type: String,
      default: '',
    },

    // Pricing & Inventory Stock
    refurbishedPrice: {
      type: Number,
      required: [true, 'Refurbished price is required'],
      min: [0, 'Refurbished price cannot be negative'],
    },
    originalRetailPrice: {
      type: Number,
      required: [true, 'Original retail price is required'],
      min: [0, 'Original retail price cannot be negative'],
    },
    stockCount: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock count cannot be negative'],
      default: 0,
    },

    // Condition & Refurbishment Grading
    conditionGrade: {
      type: String,
      required: [true, 'Condition grade is required'],
      enum: {
        values: ['Pristine', 'Excellent', 'Good', 'Fair'],
        message: 'Condition grade must be Pristine, Excellent, Good, or Fair',
      },
    },
    conditionSummary: {
      type: String,
      required: [true, 'Condition summary is required'],
    },

    // Media & Visual Assets
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one product image is required',
      },
    },
    primaryImage: {
      type: String,
      required: [true, 'Primary product image is required'],
    },

    // Technical Specifications
    specifications: {
      processor: { type: String, default: 'N/A' },
      ram: { type: String, default: 'N/A' },
      storage: { type: String, default: 'N/A' },
      display: { type: String, default: 'N/A' },
      graphics: { type: String, default: 'N/A' },
      os: { type: String, default: 'N/A' },
      color: { type: String, default: 'N/A' },
      batteryHealthPercent: {
        type: Number,
        min: [0, 'Battery health cannot be below 0%'],
        max: [100, 'Battery health cannot exceed 100%'],
        default: null,
      },
    },

    warrantyMonths: {
      type: Number,
      required: [true, 'Warranty duration in months is required'],
      default: 12,
      min: [0, 'Warranty months cannot be negative'],
    },
    digitalPassportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DigitalPassport',
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes specified in docs/ARCHITECTURE.md
productSchema.index({ title: 'text', brand: 'text', category: 'text' });
productSchema.index({ category: 1, refurbishedPrice: 1 });
productSchema.index({ conditionGrade: 1 });
// unique: true on slug field automatically creates unique index { slug: 1 }

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
