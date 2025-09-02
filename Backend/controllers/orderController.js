const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM orders');
  res.json(result.rows);
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(result.rows[0]);
});

const createOrder = asyncHandler(async (req, res) => {
  const { customerId, adminId, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Order must have at least one item');
  }

  try {
    await pool.query('BEGIN');

    const orderInsertResult = await pool.query(
      'INSERT INTO orders (customer_id, admin_id) VALUES ($1, $2) RETURNING *',
      [customerId, adminId || null]
    );

    const orderId = orderInsertResult.rows[0].id;

    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity) {
        await pool.query('ROLLBACK');
        res.status(400);
        throw new Error('Invalid order item');
      }

      await pool.query(
        'INSERT INTO order_item (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [orderId, productId, quantity]
      );
    }

    await pool.query('COMMIT');

    res.status(201).json({ message: 'Order created', orderId });
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error; // This will be caught by asyncHandler and sent to error middleware
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [
    status,
    id,
  ]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(result.rows[0]);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM orders WHERE id = $1', [id]);

  res.json({ message: 'Order deleted successfully' });
});

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
