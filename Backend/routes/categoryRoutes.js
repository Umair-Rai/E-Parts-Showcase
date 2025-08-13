const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', categoryController.getAllCategories);

router.get(
  '/:id',
  [param('id').isInt(), validateRequest],
  categoryController.getCategoryById
);

router.post(
  '/',
  [
    body('name').notEmpty(),
    body('pic').optional().isString(),
    body('specialCategory').optional().isBoolean(),
    validateRequest,
  ],
  categoryController.createCategory
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').notEmpty(),
    body('pic').optional().isString(),
    body('specialCategory').optional().isBoolean(),
    validateRequest,
  ],
  categoryController.updateCategory
);

router.delete(
  '/:id',
  [param('id').isInt(), validateRequest],
  categoryController.deleteCategory
);

module.exports = router;
