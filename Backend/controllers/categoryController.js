const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

// 📌 Helper: Ensure value is always an array
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map((v) => v.trim());
};

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
  const { name, specialCategory } = req.body;
  
  // Handle uploaded files
  const picArray = req.files ? req.files.map(file => `/uploads/categories/${file.filename}`) : [];
  
  const query =
    'INSERT INTO category (name, pic, special_category) VALUES ($1, $2, $3) RETURNING *';

  const result = await pool.query(query, [name, picArray, specialCategory === 'true']);
  res.status(201).json(result.rows[0]);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, specialCategory } = req.body;

  // Handle uploaded files - if new files uploaded, use them; otherwise keep existing
  let picArray;
  if (req.files && req.files.length > 0) {
    picArray = req.files.map(file => `/uploads/categories/${file.filename}`);
  } else {
    // Keep existing images if no new files uploaded
    const existing = await pool.query('SELECT pic FROM category WHERE id = $1', [id]);
    picArray = existing.rows[0]?.pic || [];
  }

  const query =
    'UPDATE category SET name = $1, pic = $2, special_category = $3 WHERE id = $4 RETURNING *';

  const result = await pool.query(query, [name, picArray, specialCategory === 'true', id]);
  
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
