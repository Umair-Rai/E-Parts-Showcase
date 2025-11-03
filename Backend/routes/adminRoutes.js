const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { validateRequest } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { validatePassword } = require('../utils/passwordValidation');

// Public route: login should NOT require auth
router.post(
  '/login',
  authLimiter, // ✅ SECURITY: Rate limit admin login attempts
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  adminController.login
);

// Protected routes: only authenticated admins can access
router.use(requireAuth);
router.use(requireRole('admin', 'super admin'));

// Dashboard stats route
router.get('/dashboard/stats', adminController.getDashboardStats);

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
