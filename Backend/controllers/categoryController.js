const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const { deleteFile } = require('../middleware/uploadMiddleware');
const path = require('path');

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
  const { name, specialCategory, existingImages } = req.body;

  // Get current category to access existing images
  const currentCategory = await pool.query('SELECT pic FROM category WHERE id = $1', [id]);
  
  if (currentCategory.rows.length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Parse existingImages from JSON string
  let existingImagesArray = [];
  if (existingImages) {
    try {
      existingImagesArray = JSON.parse(existingImages);
    } catch (error) {
      console.error('Error parsing existingImages:', error);
      existingImagesArray = [];
    }
  }

  // Handle new uploaded files
  const newImagesArray = req.files ? req.files.map(file => `/uploads/categories/${file.filename}`) : [];
  
  // Combine existing images (that should be kept) with new uploaded images
  const finalPicArray = [...existingImagesArray, ...newImagesArray];
  
  // Delete images that are no longer needed
  const currentImages = currentCategory.rows[0].pic || [];
  const imagesToDelete = currentImages.filter(img => !finalPicArray.includes(img));
  imagesToDelete.forEach(picPath => {
    const filename = path.basename(picPath);
    deleteFile(filename);
  });
  
  const query =
    'UPDATE category SET name = $1, pic = $2, special_category = $3 WHERE id = $4 RETURNING *';

  const result = await pool.query(query, [name, finalPicArray, specialCategory === 'true', id]);
  
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
