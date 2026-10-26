const TradeInRequest = require('../models/TradeInRequest');

// Explainable Valuation Rules Table
const calculateEstimate = (category, brand, modelName, functionalState, cosmeticGrade, batteryHealth) => {
  let baseValue = 16000;

  const modelLower = (modelName || '').toLowerCase();
  if (modelLower.includes('macbook') || modelLower.includes('iphone 14') || modelLower.includes('iphone 15')) {
    baseValue = 35000;
  } else if (modelLower.includes('iphone 13') || modelLower.includes('galaxy s22') || modelLower.includes('dell xps')) {
    baseValue = 20000;
  } else if (modelLower.includes('ipad') || modelLower.includes('thinkpad')) {
    baseValue = 18000;
  } else if (modelLower.includes('sony') || modelLower.includes('wh-1000xm4')) {
    baseValue = 10000;
  }

  // Multipliers
  let cosmeticMultiplier = 1.0;
  if (cosmeticGrade === 'Flawless') cosmeticMultiplier = 1.05;
  else if (cosmeticGrade === 'Good' || cosmeticGrade?.includes('Good')) cosmeticMultiplier = 0.9;
  else if (cosmeticGrade === 'Fair' || cosmeticGrade?.includes('Fair')) cosmeticMultiplier = 0.75;
  else if (cosmeticGrade === 'Damaged') cosmeticMultiplier = 0.5;

  let functionalDeductions = 0;
  if (functionalState) {
    if (!functionalState.powersOn) functionalDeductions += 6000;
    if (!functionalState.screenIntact) functionalDeductions += 4000;
    if (!functionalState.touchResponsive) functionalDeductions += 2000;
    if (!functionalState.camerasWork) functionalDeductions += 1500;
    if (!functionalState.batteryWorking) functionalDeductions += 1500;
  }

  let batteryDeduction = 0;
  if (batteryHealth) {
    if (batteryHealth.includes('80-90')) batteryDeduction = 1000;
    else if (batteryHealth.includes('Below 80') || batteryHealth.includes('< 80')) batteryDeduction = 2500;
  }

  const adjusted = Math.round(baseValue * cosmeticMultiplier - functionalDeductions - batteryDeduction);
  const finalValue = Math.max(1500, adjusted);

  const rangeMin = Math.round(finalValue * 0.95);
  const rangeMax = Math.round(finalValue * 1.1);

  return {
    estimatedValue: finalValue,
    indicativeRange: `₹${rangeMin.toLocaleString('en-IN')}–₹${rangeMax.toLocaleString('en-IN')}`,
    breakdown: {
      baseModelValue: baseValue,
      cosmeticAdjustment: Math.round(baseValue * (cosmeticMultiplier - 1)),
      functionalDeductions,
      batteryAdjustment: -batteryDeduction,
    },
  };
};

// @desc    Calculate trade-in valuation
// @route   POST /api/trade-in/calculate
// @access  Public
const calculateValuation = (req, res) => {
  const { category, brand, modelName, functionalState, cosmeticGrade, batteryHealth } = req.body;

  const result = calculateEstimate(
    category,
    brand,
    modelName,
    functionalState,
    cosmeticGrade,
    batteryHealth
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

// @desc    Submit trade-in request
// @route   POST /api/trade-in/submit
// @access  Private
const submitTradeIn = async (req, res, next) => {
  try {
    const {
      deviceCategory,
      brand,
      modelName,
      specifications,
      functionalState,
      cosmeticGrade,
      estimatedValue,
      valuationBreakdown,
    } = req.body;
    let normalizedCosmetic = cosmeticGrade || 'Good (Minor Scratches)';
    if (normalizedCosmetic === 'Good') normalizedCosmetic = 'Good (Minor Scratches)';
    if (normalizedCosmetic === 'Fair') normalizedCosmetic = 'Fair (Heavy Wear)';

    const request = await TradeInRequest.create({
      user: req.user._id,
      deviceCategory: deviceCategory || 'Smartphones',
      brand: brand || 'Apple',
      modelName: modelName || 'Device',
      specifications: specifications || '',
      functionalState: functionalState || {
        powersOn: true,
        screenIntact: true,
        touchResponsive: true,
        camerasWork: true,
        batteryWorking: true,
      },
      cosmeticGrade: normalizedCosmetic,
      estimatedValue: Number(estimatedValue) || 12000,
      valuationBreakdown: valuationBreakdown || {},
      status: 'Submitted',
    });

    res.status(201).json({
      success: true,
      message: 'Trade-in request submitted successfully for certified lab inspection.',
      request,
      tradeInRequest: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's trade-in requests
// @route   GET /api/trade-in/my-requests
// @access  Private
const getMyTradeIns = async (req, res, next) => {
  try {
    const requests = await TradeInRequest.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trade-ins (Admin)
// @route   GET /api/trade-in
// @access  Private/Admin
const getAllTradeIns = async (req, res, next) => {
  try {
    const tradeIns = await TradeInRequest.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tradeIns,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trade-in review & issue voucher (Admin)
// @route   PATCH /api/trade-in/:id
// @access  Private/Admin
const updateTradeInStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, approvedValue, inspectorNotes } = req.body;

    const tradeIn = await TradeInRequest.findById(id);
    if (!tradeIn) {
      return res.status(404).json({ success: false, message: 'Trade-in request not found.' });
    }

    if (status) tradeIn.status = status;
    if (approvedValue !== undefined) tradeIn.approvedValue = Number(approvedValue);
    if (inspectorNotes) tradeIn.inspectorNotes = inspectorNotes;

    if (status === 'Approved' && !tradeIn.voucherCode) {
      tradeIn.voucherCode = `RLP-TRADE-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await tradeIn.save();

    res.status(200).json({
      success: true,
      message: `Trade-in status updated to ${status}.`,
      tradeIn,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateValuation,
  submitTradeIn,
  getMyTradeIns,
  getAllTradeIns,
  updateTradeInStatus,
};
