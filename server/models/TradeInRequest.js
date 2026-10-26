const mongoose = require('mongoose');

const tradeInRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    deviceCategory: {
      type: String,
      required: [true, 'Device category is required'],
      enum: {
        values: ['Laptops', 'Smartphones', 'Tablets'],
        message: 'Device category must be Laptops, Smartphones, or Tablets',
      },
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    modelName: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true,
    },
    specifications: {
      type: String,
      default: '',
    },

    // Customer Self-Reported Diagnostics
    functionalState: {
      powersOn: { type: Boolean, required: [true, 'Power state report is required'] },
      screenIntact: { type: Boolean, required: [true, 'Screen condition report is required'] },
      touchResponsive: { type: Boolean, required: [true, 'Touch response report is required'] },
      camerasWork: { type: Boolean, required: [true, 'Camera functionality report is required'] },
      batteryWorking: { type: Boolean, required: [true, 'Battery state report is required'] },
    },
    cosmeticGrade: {
      type: String,
      enum: {
        values: ['Flawless', 'Good (Minor Scratches)', 'Fair (Heavy Wear)', 'Damaged'],
        message: 'Cosmetic grade must be Flawless, Good (Minor Scratches), Fair (Heavy Wear), or Damaged',
      },
      required: [true, 'Cosmetic grade assessment is required'],
    },

    // Explainable Valuation
    estimatedValue: {
      type: Number,
      required: [true, 'Estimated trade-in value is required'],
      min: [0, 'Estimated value cannot be negative'],
    },
    valuationBreakdown: {
      baseModelValue: { type: Number, default: 0 },
      cosmeticMultiplier: { type: Number, default: 1.0 },
      functionalDeductions: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: {
        values: ['Submitted', 'Under Lab Inspection', 'Approved', 'Rejected', 'Voucher Issued'],
        message: '{VALUE} is not a valid trade-in status',
      },
      default: 'Submitted',
    },
    approvedValue: {
      type: Number,
      min: [0, 'Approved value cannot be negative'],
    },
    voucherCode: {
      type: String,
      default: '',
    },
    inspectorNotes: {
      type: String,
      default: '',
    },

    // Regulatory & Ethical Disclaimer
    verificationDisclosure: {
      type: String,
      default: 'Submitted diagnostics are provisional estimates. Final voucher requires physical verification at RELOOP testing center.',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tradeInRequestSchema.index({ user: 1, createdAt: -1 });
tradeInRequestSchema.index({ status: 1 });

const TradeInRequest = mongoose.model('TradeInRequest', tradeInRequestSchema);

module.exports = TradeInRequest;
