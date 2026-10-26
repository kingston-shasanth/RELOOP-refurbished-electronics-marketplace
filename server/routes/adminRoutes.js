const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getCustomers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, adminOnly, getDashboardMetrics);
router.get('/customers', protect, adminOnly, getCustomers);

module.exports = router;
