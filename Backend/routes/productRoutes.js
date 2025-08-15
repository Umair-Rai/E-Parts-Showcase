const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.use(requireAuth);

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('Product ID must be an integer'), validateRequest],
  productController.getProductById
);

// Create product
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isInt().withMessage('Category ID must be an integer'),
    body('sizes').isArray().withMessage('Sizes must be an array'),
    body('descriptions').isArray().withMessage('Descriptions must be an array'),
    body('pics').isArray().withMessage('Pics must be an array'),
    body('adminId').optional().isInt(),
    validateRequest,
  ],
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').notEmpty(),
    body('categoryId').isInt(),
    body('sizes').isArray(),
    body('descriptions').isArray(),
    body('pics').isArray(),
    body('adminId').optional().isInt(),
    validateRequest,
  ],
  productController.updateProduct
);

// Delete product
router.delete(
  '/:id',
  [param('id').isInt(), validateRequest],
  productController.deleteProduct
);

module.exports = router;
