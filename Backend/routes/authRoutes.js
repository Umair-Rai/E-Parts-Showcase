const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min length is 6'),
    body('role').isIn(['admin', 'customer']).withMessage('Role must be admin or customer'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['admin', 'customer']).withMessage('Role must be admin or customer'),
  ],
  validateRequest,
  login
);

router.get('/me', requireAuth, me);

module.exports = router;
