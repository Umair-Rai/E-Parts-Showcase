const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');
const { uploadProductImages, handleUploadError } = require('../middleware/uploadMiddleware');

router.use(requireAuth);

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('Product ID must be an integer'), validateRequest],
  productController.getProductById
);

// Create product with image upload
router.post(
  '/',
  uploadProductImages,
  handleUploadError,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    // Remove this line: body('adminId').optional().isInt(),
    validateRequest,
  ],
  productController.createProduct
);

// Update product with image upload
router.put(
  '/:id',
  uploadProductImages,
  handleUploadError,
  [
    param('id').isInt(),
    body('name').notEmpty(),
    body('categoryId').isInt(),
    body('adminId').optional().isInt(),
    validateRequest,
  ],
  productController.updateProduct
);

// Delete specific product image
router.delete(
  '/:id/images/:imageIndex',
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
  [param('id').isInt(), validateRequest],
  productController.deleteProduct
);

module.exports = router;
