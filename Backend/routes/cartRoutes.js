const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', cartController.getCart);

router.post(
  '/',
  [
    body('product_id').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('size').optional().isString(),
    body('description').optional().isString(),
    validateRequest,
  ],
  cartController.addToCart
);

router.put(
  '/:itemId',
  [
    param('itemId').isInt().withMessage('Item ID must be an integer'),
    body('quantity').optional().isInt({ min: 1 }),
    body('size').optional().isString(),
    body('description').optional().isString(),
    validateRequest,
  ],
  cartController.updateCartItem
);

router.delete(
  '/item/:itemId',
  [param('itemId').isInt().withMessage('Item ID must be an integer'), validateRequest],
  cartController.removeFromCart
);

router.delete('/clear', cartController.clearCart);

module.exports = router;
