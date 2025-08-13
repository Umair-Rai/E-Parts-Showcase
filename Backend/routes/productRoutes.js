const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', productController.getAllProducts);

router.get(
  '/:id',
  [param('id').isInt().withMessage('Product ID must be an integer'), validateRequest],
  productController.getProductById
);

router.post(
  '/',
  [
    body('name').notEmpty(),
    body('categoryId').isInt(),
    body('sizes').isArray(),
    body('descriptions').isArray(),
    body('pic').optional().isString(),
    body('adminId').optional().isInt(),
    validateRequest,
  ],
  productController.createProduct
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').notEmpty(),
    body('categoryId').isInt(),
    body('sizes').isArray(),
    body('descriptions').isArray(),
    body('pic').optional().isString(),
    body('adminId').optional().isInt(),
    validateRequest,
  ],
  productController.updateProduct
);

router.delete(
  '/:id',
  [param('id').isInt(), validateRequest],
  productController.deleteProduct
);

module.exports = router;
