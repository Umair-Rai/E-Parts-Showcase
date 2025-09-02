const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');
const { uploadCategoryImages, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes (no authentication required)
router.get('/', categoryController.getAllCategories);

router.get(
  '/:id',
  [param('id').isInt(), validateRequest],
  categoryController.getCategoryById
);

// Protected routes (authentication required)
router.post(
  '/',
  requireAuth,
  uploadCategoryImages,
  handleUploadError,
  [
    body('name').notEmpty(),
    body('specialCategory').optional().isBoolean(),
    validateRequest,
  ],
  categoryController.createCategory
);

router.put(
  '/:id',
  requireAuth,
  uploadCategoryImages,
  handleUploadError,
  [
    param('id').isInt(),
    body('name').notEmpty(),
    body('specialCategory').optional().isBoolean(),
    validateRequest,
  ],
  categoryController.updateCategory
);

router.delete(
  '/:id',
  requireAuth,
  [param('id').isInt(), validateRequest],
  categoryController.deleteCategory
);

module.exports = router;
