const express = require('express');
const router = express.Router();
const {
  calculateValuation,
  submitTradeIn,
  getMyTradeIns,
  getAllTradeIns,
  updateTradeInStatus,
} = require('../controllers/tradeInController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/calculate', calculateValuation);
router.post('/submit', protect, submitTradeIn);
router.get('/my-requests', protect, getMyTradeIns);

// Admin routes
router.get('/', protect, adminOnly, getAllTradeIns);
router.patch('/:id', protect, adminOnly, updateTradeInStatus);

module.exports = router;
