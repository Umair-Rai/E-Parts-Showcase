const pool = require("../config/db");

// ✅ Add item to cart
exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "userId, productId, and quantity are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, productId, quantity]
    );

    res.status(201).json({
      message: "Item added to cart",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding to cart:", err.message);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

// ✅ Get all items in user's cart
exports.getCartByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.sizes, p.descriptions, p.pic
       FROM cart c
       JOIN product p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching cart:", err.message);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

// ✅ Update item quantity
exports.updateCartItem = async (req, res) => {
  const { id } = req.params; // cart item id
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ error: "Quantity is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE cart 
       SET quantity = $1 
       WHERE id = $2 
       RETURNING *`,
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
      `DELETE FROM cart WHERE id = $1 RETURNING *`,
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
