const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const customerController = require('../controllers/customerController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', customerController.getAllCustomers);

router.get(
  '/:id',
  [param('id').isInt().withMessage('Customer ID must be an integer'), validateRequest],
  customerController.getCustomerById
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Customer ID must be an integer'),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('number').optional().notEmpty(),
    body('password').optional().isLength({ min: 6 }),
    validateRequest,
  ],
  customerController.updateCustomer
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('Customer ID must be an integer'), validateRequest],
  customerController.deleteCustomer
);

module.exports = router;
