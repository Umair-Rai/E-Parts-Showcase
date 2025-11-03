const pool = require("../config/db");

// ✅ Add item to cart with proper schema
exports.addToCart = async (req, res) => {
  const { userId, productId, quantity, size, description } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "userId, productId, and quantity are required" });
  }

  try {
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Check if user has a cart, create if not
    let cartResult = await connection.execute(
      'SELECT id FROM cart WHERE customer_id = ?',
      [userId]
    );
    
    let cartId;
    if (cartResult[0].length === 0) {
      // Create new cart
      const newCart = await connection.execute(
        'INSERT INTO cart (customer_id) VALUES (?)',
        [userId]
      );
      cartId = newCart[0].insertId;
    } else {
      cartId = cartResult[0][0].id;
    }
    
    // Check if item already exists in cart
    const existingItem = await connection.execute(
      'SELECT id, quantity FROM cart_item WHERE cart_id = ? AND product_id = ? AND size = ?',
      [cartId, productId, size || null]
    );
    
    if (existingItem[0].length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem[0][0].quantity + parseInt(quantity);
      const result = await connection.execute(
        'UPDATE cart_item SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem[0][0].id]
      );
      
      await connection.commit();
      connection.release();
      return res.status(200).json({
        message: "Cart item quantity updated",
        data: { id: existingItem[0][0].id, quantity: newQuantity },
      });
    } else {
      // Add new item to cart
      const result = await connection.execute(
        'INSERT INTO cart_item (cart_id, product_id, quantity, size, description) VALUES (?, ?, ?, ?, ?)',
        [cartId, productId, quantity, size, description]
      );
      
      await connection.commit();
      connection.release();
      return res.status(201).json({
        message: "Item added to cart",
        data: { id: result[0].insertId, cart_id: cartId, product_id: productId, quantity, size, description },
      });
    }
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error adding to cart:", err.message);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

// ✅ Get all items in user's cart
exports.getCartByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.execute(
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
       WHERE ct.customer_id = ?
       ORDER BY ci.id DESC`,
      [userId]
    );

    res.json(result[0]);
  } catch (err) {
    console.error("❌ Error fetching cart:", err.message);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

// ✅ Update cart item quantity and/or size
exports.updateCartItem = async (req, res) => {
  const { id } = req.params; // cart_item id
  const { quantity, size } = req.body;

  // Validate that at least one field is being updated
  if (!quantity && !size) {
    return res.status(400).json({ error: "At least one field (quantity or size) is required" });
  }

  // Validate quantity if provided
  if (quantity && quantity < 1) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  try {
    // ✅ SECURITY: Verify cart item ownership
    const ownershipCheck = await pool.execute(
      `SELECT ct.customer_id FROM cart_item ci 
       JOIN cart ct ON ci.cart_id = ct.id 
       WHERE ci.id = ?`,
      [id]
    );

    if (ownershipCheck[0].length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const cartOwnerId = ownershipCheck[0][0].customer_id;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Allow only owner or admin
    if (cartOwnerId !== currentUserId && userRole !== 'admin' && userRole !== 'super admin') {
      console.warn(`IDOR attempt: User ${currentUserId} tried to update cart item of user ${cartOwnerId}`);
      return res.status(403).json({ error: "Forbidden: You can only modify your own cart items" });
    }
    let updateQuery = 'UPDATE cart_item SET ';
    let updateParams = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (quantity) {
      updateQuery += `quantity = ?`;
      updateParams.push(quantity);
      paramIndex++;
    }

    if (size) {
      if (quantity) {
        updateQuery += ', ';
      }
      updateQuery += `size = ?`;
      updateParams.push(size);
      paramIndex++;
    }

    updateQuery += ` WHERE id = ?`;
    updateParams.push(id);

    const result = await pool.execute(updateQuery, updateParams);

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Get the updated item
    const updatedItem = await pool.execute('SELECT * FROM cart_item WHERE id = ?', [id]);
    res.json({
      message: "Cart item updated successfully",
      data: updatedItem[0][0],
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
    // ✅ SECURITY: Verify cart item ownership
    const ownershipCheck = await pool.execute(
      `SELECT ct.customer_id FROM cart_item ci 
       JOIN cart ct ON ci.cart_id = ct.id 
       WHERE ci.id = ?`,
      [id]
    );

    if (ownershipCheck[0].length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const cartOwnerId = ownershipCheck[0][0].customer_id;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Allow only owner or admin
    if (cartOwnerId !== currentUserId && userRole !== 'admin' && userRole !== 'super admin') {
      console.warn(`IDOR attempt: User ${currentUserId} tried to remove cart item of user ${cartOwnerId}`);
      return res.status(403).json({ error: "Forbidden: You can only remove your own cart items" });
    }
    const result = await pool.execute(
      'DELETE FROM cart_item WHERE id = ?',
      [id]
    );

    if (result[0].affectedRows === 0) {
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
    await pool.execute(
      `DELETE FROM cart_item 
       WHERE cart_id IN (
         SELECT id FROM cart WHERE customer_id = ?
       )`,
      [userId]
    );

    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("❌ Error clearing cart:", err.message);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
