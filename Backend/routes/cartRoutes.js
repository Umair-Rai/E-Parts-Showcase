const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireCartOwnership } = require('../middleware/rbacMiddleware');
const {
    getCartByUser,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');

// Get all items in customer's cart - must be owner or admin
router.get('/:userId', requireAuth, requireCartOwnership, getCartByUser);

// Add item to cart - must be owner or admin
router.post('/add', requireAuth, requireCartOwnership, addToCart);

// Update cart item quantity - ownership checked in controller
router.put('/update/:id', requireAuth, updateCartItem);

// Remove item from cart - ownership checked in controller
router.delete('/remove/:id', requireAuth, removeCartItem);

// Clear entire cart - must be owner or admin
router.delete('/clear/:userId', requireAuth, requireCartOwnership, clearCart);

module.exports = router;
