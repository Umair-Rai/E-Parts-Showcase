const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { register, login, me, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');
const { validatePassword } = require('../utils/passwordValidation');
const { authLimiter, otpLimiter, passwordResetLimiter, registerLimiter } = require('../middleware/rateLimitMiddleware');

router.post(
  '/register',
  registerLimiter, // ✅ SECURITY: Rate limit registrations
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    }),
    body('role').isIn(['admin', 'super admin', 'customer']).withMessage('Role must be admin, super admin, or customer'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  authLimiter, // ✅ SECURITY: Rate limit login attempts
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['admin', 'super admin', 'customer']).withMessage('Role must be admin, super admin, or customer'),
  ],
  validateRequest,
  login
);

router.get('/me', requireAuth, me);

// Forgot Password Routes
router.post(
  '/forgot-password',
  passwordResetLimiter, // ✅ SECURITY: Rate limit password reset requests
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('userType').optional().isIn(['customer', 'admin']).withMessage('User type must be customer or admin'),
  ],
  validateRequest,
  forgotPassword
);

router.post(
  '/verify-otp',
  otpLimiter, // ✅ SECURITY: Rate limit OTP verification attempts
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validateRequest,
  verifyOTP
);

router.post(
  '/reset-password',
  otpLimiter, // ✅ SECURITY: Rate limit password reset
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    }),
    body('userType').optional().isIn(['customer', 'admin']).withMessage('User type must be customer or admin'),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;
