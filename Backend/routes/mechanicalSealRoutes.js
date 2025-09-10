const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const mechanicalSealController = require('../controllers/mechanicalSealController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validate');

// Get mechanical seal attributes by product ID (public access)
router.get(
    '/:productId',
    mechanicalSealController.getMechanicalSealAttributesByProductId
);

// Create mechanical seal attributes (requires authentication)
router.post(
    '/',
    requireAuth,
    [
        body('productId')
            .isInt()
            .withMessage('Product ID must be an integer'),
        body('material')
            .notEmpty()
            .withMessage('Material is required'),
        body('temperature')
            .notEmpty()
            .withMessage('Temperature is required'),
        body('pressure')
            .notEmpty()
            .withMessage('Pressure is required'),
        body('speed')
            .notEmpty()
            .withMessage('Speed is required'),
        validateRequest
    ],
    mechanicalSealController.createMechanicalSealAttributes
);

module.exports = router;
