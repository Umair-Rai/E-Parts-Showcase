const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
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
// Create product with image upload - ADMIN ONLY
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'super admin'),
  uploadProductImages,
  handleUploadError,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    validateRequest,
  ],
  productController.createProduct
);

// Create product with mechanical seal attributes - ADMIN ONLY
router.post(
  '/add',
  requireAuth,
  requireRole('admin', 'super admin'),
  uploadProductImages,
  handleUploadError,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    body('sizes').custom((value) => {
      // Handle both array and JSON string formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Sizes must be an array');
          }
          return true;
        } catch (e) {
          throw new Error('Sizes must be a valid JSON array');
        }
      }
      if (!Array.isArray(value)) {
        throw new Error('Sizes must be an array');
      }
      return true;
    }),
    body('descriptions').custom((value) => {
      // Handle both array and JSON string formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Descriptions must be an array');
          }
          return true;
        } catch (e) {
          throw new Error('Descriptions must be a valid JSON array');
        }
      }
      if (!Array.isArray(value)) {
        throw new Error('Descriptions must be an array');
      }
      return true;
    }),
    body('mechanicalSealAttributes').optional().custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Mechanical seal attributes must be an array');
          }
          return true;
        } catch (e) {
          throw new Error('Mechanical seal attributes must be a valid JSON array');
        }
      }
      if (value && !Array.isArray(value)) {
        throw new Error('Mechanical seal attributes must be an array');
      }
      return true;
    }),
    validateRequest,
  ],
  productController.createProductWithMechanicalSeal
);

// Update product with image upload - ADMIN ONLY
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'super admin'),
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

// Delete specific product image - ADMIN ONLY
router.delete(
  '/:id/images/:imageIndex',
  requireAuth,
  requireRole('admin', 'super admin'),
  [
    param('id').isInt().withMessage('Product ID must be an integer'),
    param('imageIndex').isInt().withMessage('Image index must be an integer'),
    validateRequest
  ],
  productController.deleteProductImage
);

// Delete product - ADMIN ONLY
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'super admin'),
  [param('id').isInt(), validateRequest],
  productController.deleteProduct
);

module.exports = router;
