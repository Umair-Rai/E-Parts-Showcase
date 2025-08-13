const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

const getAllCategories = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM category');
  res.json(result.rows);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM category WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json(result.rows[0]);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, pic, specialCategory } = req.body;

  const query =
    'INSERT INTO category (name, pic, special_category) VALUES ($1, $2, $3) RETURNING *';

  const result = await pool.query(query, [name, pic, specialCategory]);
  res.status(201).json(result.rows[0]);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, pic, specialCategory } = req.body;

  const query =
    'UPDATE category SET name = $1, pic = $2, special_category = $3 WHERE id = $4 RETURNING *';

  const result = await pool.query(query, [name, pic, specialCategory, id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json(result.rows[0]);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM category WHERE id = $1', [id]);

  res.json({ message: 'Category deleted successfully' });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
