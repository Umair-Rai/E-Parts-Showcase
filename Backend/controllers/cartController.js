const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

// Get all items in customer's cart
const getCart = asyncHandler(async (req, res) => {
  const customerId = req.user.id; // from auth middleware

  // Ensure the cart exists
  let cart = await pool.query('SELECT * FROM cart WHERE customer_id = $1', [customerId]);
  if (cart.rows.length === 0) {
    // Create a new cart for this customer
    cart = await pool.query(
      'INSERT INTO cart (customer_id) VALUES ($1) RETURNING *',
      [customerId]
    );
  }

  const items = await pool.query(
    `SELECT ci.id, ci.product_id, p.name, p.price, ci.quantity, ci.size, ci.description
     FROM cart_item ci
     JOIN product p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cart.rows[0].id]
  );

  res.json({
    cart: cart.rows[0],
    items: items.rows,
  });
});

// Add product to cart
const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity, size, description } = req.body;
  const customerId = req.user.id;

  let cart = await pool.query('SELECT * FROM cart WHERE customer_id = $1', [customerId]);
  if (cart.rows.length === 0) {
    cart = await pool.query(
      'INSERT INTO cart (customer_id) VALUES ($1) RETURNING *',
      [customerId]
    );
  }

  const cartId = cart.rows[0].id;

  // Check if item already exists in cart
  const existingItem = await pool.query(
    'SELECT * FROM cart_item WHERE cart_id = $1 AND product_id = $2',
    [cartId, product_id]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    const updatedItem = await pool.query(
      'UPDATE cart_item SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
      [quantity, existingItem.rows[0].id]
    );
    res.json(updatedItem.rows[0]);
  } else {
    // Insert new item
    const newItem = await pool.query(
      'INSERT INTO cart_item (cart_id, product_id, quantity, size, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cartId, product_id, quantity, size, description]
    );
    res.json(newItem.rows[0]);
  }
});

// Update cart item quantity or details
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity, size, description } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  if (quantity !== undefined) {
    fields.push(`quantity = $${idx++}`);
    values.push(quantity);
  }
  if (size !== undefined) {
    fields.push(`size = $${idx++}`);
    values.push(size);
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }

  if (fields.length === 0) {
    res.status(400);
    throw new Error('No fields to update');
  }

  values.push(itemId);

  const result = await pool.query(
    `UPDATE cart_item SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  res.json(result.rows[0]);
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  await pool.query('DELETE FROM cart_item WHERE id = $1', [itemId]);
  res.json({ message: 'Item removed from cart' });
});

// Clear entire cart
const clearCart = asyncHandler(async (req, res) => {
  const customerId = req.user.id;

  const cart = await pool.query('SELECT id FROM cart WHERE customer_id = $1', [customerId]);
  if (cart.rows.length === 0) {
    res.json({ message: 'Cart already empty' });
    return;
  }

  await pool.query('DELETE FROM cart_item WHERE cart_id = $1', [cart.rows[0].id]);
  res.json({ message: 'Cart cleared' });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
