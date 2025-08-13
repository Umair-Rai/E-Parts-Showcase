const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

const getAllProducts = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM product');
  res.json(result.rows);
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM product WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(result.rows[0]);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, categoryId, sizes, descriptions, pic, adminId } = req.body;

  const query =
    'INSERT INTO product (name, category_id, sizes, descriptions, pic, admin_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

  const result = await pool.query(query, [name, categoryId, sizes, descriptions, pic, adminId]);
  res.status(201).json(result.rows[0]);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, sizes, descriptions, pic, adminId } = req.body;

  const query =
    'UPDATE product SET name = $1, category_id = $2, sizes = $3, descriptions = $4, pic = $5, admin_id = $6 WHERE id = $7 RETURNING *';

  const result = await pool.query(query, [
    name,
    categoryId,
    sizes,
    descriptions,
    pic,
    adminId,
    id,
  ]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(result.rows[0]);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM product WHERE id = $1', [id]);

  res.json({ message: 'Product deleted successfully' });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
