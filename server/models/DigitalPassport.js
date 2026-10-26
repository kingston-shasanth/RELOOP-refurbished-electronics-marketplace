const mongoose = require('mongoose');

const digitalPassportSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Associated product ID is required'],
      unique: true,
    },
    deviceSerialNumber: {
      type: String,
      required: [true, 'Device serial number is required'],
      trim: true,
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inspectorName: {
      type: String,
      default: 'RELOOP Certified Lab',
    },

    // Diagnostic Scorecard
    diagnosticSummaryScore: {
      type: Number,
      required: [true, 'Diagnostic summary score is required'],
      min: [0, 'Diagnostic score cannot be less than 0'],
      max: [100, 'Diagnostic score cannot exceed 100'],
      default: 95,
    },
    subsystemChecks: {
      screen: {
        status: {
          type: String,
          enum: ['Pass', 'Minor Blemish', 'Replaced OEM'],
          default: 'Pass',
        },
        notes: { type: String, default: 'Display tested for dead pixels, color accuracy, and backlight uniformity.' },
      },
      battery: {
        status: {
          type: String,
          enum: ['Pass', 'Replaced OEM', 'Not Applicable'],
          default: 'Pass',
        },
        healthPercent: {
          type: Number,
          min: [0, 'Battery health cannot be below 0%'],
          max: [100, 'Battery health cannot exceed 100%'],
          default: null,
        },
        cycleCount: {
          type: Number,
          default: null,
        },
      },
      chassis: {
        status: {
          type: String,
          enum: ['Flawless', 'Micro-scratches', 'Visible wear'],
          default: 'Flawless',
        },
        notes: { type: String, default: 'Chassis inspected for dents, hinge integrity, and structural rigidity.' },
      },
      portsAndCharging: {
        status: {
          type: String,
          enum: ['Pass', 'Cleaned & Serviced'],
          default: 'Pass',
        },
        notes: { type: String, default: 'All USB, audio, and charging ports verified with power delivery tester.' },
      },
      camerasAndSensors: {
        status: {
          type: String,
          enum: ['Pass', 'Serviced'],
          default: 'Pass',
        },
        notes: { type: String, default: 'Sensors, microphones, and camera autofocus calibrated.' },
      },
      audioAndMics: {
        status: {
          type: String,
          enum: ['Pass', 'Deep-cleaned'],
          default: 'Pass',
        },
        notes: { type: String, default: 'Stereo balance and microphone gain frequency verified.' },
      },
      connectivityWifiBt: {
        status: {
          type: String,
          enum: ['Pass'],
          default: 'Pass',
        },
        notes: { type: String, default: 'Dual-band Wi-Fi and Bluetooth throughput tested.' },
      },
    },

    // Refurbishment Ledger
    partsReplaced: [
      {
        partName: { type: String, required: true },
        replacementType: {
          type: String,
          enum: ['OEM Original', 'Certified High-Grade'],
          default: 'OEM Original',
        },
        date: { type: Date, default: Date.now },
      },
    ],

    // Environmental Impact Metrics
    carbonOffsetKg: {
      type: Number,
      default: 45.2,
    },
    eWastePreventedGrams: {
      type: Number,
      default: 1850,
    },

    // Ethical & Regulatory Disclosure
    verificationDisclaimer: {
      type: String,
      default: 'All diagnostics performed under RELOOP Standard Lab Protocol 4.2. Diagnostic records are verified prior to sale.',
    },
  },
  {
    timestamps: true,
  }
);

// unique: true on productId automatically creates unique index { productId: 1 }

const DigitalPassport = mongoose.model('DigitalPassport', digitalPassportSchema);

module.exports = DigitalPassport;
