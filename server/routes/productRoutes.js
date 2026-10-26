const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  getProductPassport,
  compareProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/compare', compareProducts);
router.post('/compare', compareProducts);
router.get('/:identifier', getProductByIdOrSlug);
router.get('/:id/passport', getProductPassport);

// Admin operations
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
