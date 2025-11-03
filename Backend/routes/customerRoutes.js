const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const customerController = require('../controllers/customerController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole, requireOwnership } = require('../middleware/rbacMiddleware');
const { validateRequest } = require('../middleware/validate');
const { validatePassword } = require('../utils/passwordValidation');

router.use(requireAuth);

// Only admins can view all customers
router.get('/', requireRole('admin', 'super admin'), customerController.getAllCustomers);

router.get(
  '/:id',
  [param('id').isInt().withMessage('Customer ID must be an integer'), validateRequest],
  requireOwnership('id'),
  customerController.getCustomerById
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Customer ID must be an integer'),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('number').optional().notEmpty(),
    // ✅ SECURITY FIX: Strong password validation on update
    body('password').optional().custom((value) => {
      if (value) {
        const validation = validatePassword(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
      }
      return true;
    }),
    validateRequest,
  ],
  requireOwnership('id'),
  customerController.updateCustomer
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('Customer ID must be an integer'), validateRequest],
  requireRole('admin', 'super admin'), // Only admins can delete customers
  customerController.deleteCustomer
);

module.exports = router;
