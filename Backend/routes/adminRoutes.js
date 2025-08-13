const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

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
    body('role').optional().isIn(['admin']),
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
