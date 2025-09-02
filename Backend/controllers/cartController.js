const pool = require("../config/db");

// ✅ Add item to cart with proper schema
exports.addToCart = async (req, res) => {
  const { userId, productId, quantity, size, description } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "userId, productId, and quantity are required" });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');
    
    // Check if user has a cart, create if not
    let cartResult = await pool.query(
      'SELECT id FROM cart WHERE customer_id = $1',
      [userId]
    );
    
    let cartId;
    if (cartResult.rows.length === 0) {
      // Create new cart
      const newCart = await pool.query(
        'INSERT INTO cart (customer_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }
    
    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_item WHERE cart_id = $1 AND product_id = $2 AND size = $3',
      [cartId, productId, size || null]
    );
    
    if (existingItem.rows.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem.rows[0].quantity + parseInt(quantity);
      const result = await pool.query(
        'UPDATE cart_item SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.rows[0].id]
      );
      
      await pool.query('COMMIT');
      return res.status(200).json({
        message: "Cart item quantity updated",
        data: result.rows[0],
      });
    } else {
      // Add new item to cart
      const result = await pool.query(
        'INSERT INTO cart_item (cart_id, product_id, quantity, size, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [cartId, productId, quantity, size, description]
      );
      
      await pool.query('COMMIT');
      return res.status(201).json({
        message: "Item added to cart",
        data: result.rows[0],
      });
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("❌ Error adding to cart:", err.message);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

// ✅ Get all items in user's cart
exports.getCartByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.size,
        ci.description as cart_description,
        p.id as product_id,
        p.name,
        p.sizes,
        p.descriptions,
        p.pic,
        c.name as category_name
       FROM cart_item ci
       JOIN cart ct ON ci.cart_id = ct.id
       JOIN product p ON ci.product_id = p.id
       LEFT JOIN category c ON p.category_id = c.id
       WHERE ct.customer_id = $1
       ORDER BY ci.id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching cart:", err.message);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

// ✅ Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const { id } = req.params; // cart_item id
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  try {
    const result = await pool.query(
      'UPDATE cart_item SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({
      message: "Cart item updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating cart item:", err.message);
    res.status(500).json({ error: "Failed to update cart item" });
  }
};

// ✅ Remove item from cart
exports.removeCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cart_item WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item removed successfully" });
  } catch (err) {
    console.error("❌ Error removing cart item:", err.message);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
};

// ✅ Clear entire cart
exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(
      `DELETE FROM cart_item 
       WHERE cart_id IN (
         SELECT id FROM cart WHERE customer_id = $1
       )`,
      [userId]
    );

    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("❌ Error clearing cart:", err.message);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
