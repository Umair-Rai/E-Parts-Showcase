const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', orderController.getAllOrders);

router.get(
  '/:id',
  [param('id').isInt(), validateRequest],
  orderController.getOrderById
);

router.post(
  '/',
  [
    body('customerId').isInt(),
    body('adminId').optional().isInt(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isInt({ min: 1 }),
    validateRequest,
  ],
  orderController.createOrder
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('status').isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    validateRequest,
  ],
  orderController.updateOrderStatus
);

router.delete(
  '/:id',
  [param('id').isInt(), validateRequest],
  orderController.deleteOrder
);

module.exports = router;
