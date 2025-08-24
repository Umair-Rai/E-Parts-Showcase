const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

// Public route: login should NOT require auth
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  adminController.login
);

// Protected routes: only authenticated admins can access
router.use(requireAuth);

router.get('/', adminController.getAllAdmins);

router.get(
  '/:id',
  [param('id').isInt().withMessage('Admin ID must be an integer'), validateRequest],
  adminController.getAdminById
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Admin ID must be an integer'),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'super admin']),
    validateRequest,
  ],
  adminController.updateAdmin
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('Admin ID must be an integer'), validateRequest],
  adminController.deleteAdmin
);

module.exports = router;
