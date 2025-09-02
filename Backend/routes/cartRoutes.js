const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
    getCartByUser,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require('../controllers/cartController');

// Get all items in customer's cart
router.get('/:userId', requireAuth, getCartByUser);

// Add item to cart
router.post('/add', requireAuth, addToCart);

// Update cart item quantity
router.put('/update/:id', requireAuth, updateCartItem);

// Remove item from cart
router.delete('/remove/:id', requireAuth, removeCartItem);

// Clear entire cart
router.delete('/clear/:userId', requireAuth, clearCart);

module.exports = router;
