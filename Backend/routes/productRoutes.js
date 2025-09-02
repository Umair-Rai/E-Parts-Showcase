const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');
const { uploadProductImages, handleUploadError } = require('../middleware/uploadMiddleware');

// ✅ PUBLIC ROUTES (no authentication required)
// Get all products - customers can view without login
router.get('/', productController.getAllProducts);

// Get product by ID - customers can view individual products
router.get(
  '/:id',
  [param('id').isInt().withMessage('Product ID must be an integer'), validateRequest],
  productController.getProductById
);

// ✅ PROTECTED ROUTES (authentication required for admin operations)
// Create product with image upload
router.post(
  '/',
  requireAuth,
  uploadProductImages,
  handleUploadError,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    validateRequest,
  ],
  productController.createProduct
);

// Update product with image upload
router.put(
  '/:id',
  requireAuth,
  uploadProductImages,
  handleUploadError,
  [
    param('id').isInt().withMessage('Product ID must be an integer'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    validateRequest,
  ],
  productController.updateProduct
);

// Delete specific product image
router.delete(
  '/:id/images/:imageIndex',
  requireAuth,
  [
    param('id').isInt().withMessage('Product ID must be an integer'),
    param('imageIndex').isInt().withMessage('Image index must be an integer'),
    validateRequest
  ],
  productController.deleteProductImage
);

// Delete product
router.delete(
  '/:id',
  requireAuth,
  [param('id').isInt(), validateRequest],
  productController.deleteProduct
);

module.exports = router;
