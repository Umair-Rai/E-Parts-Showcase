const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const { deleteFile } = require('../middleware/uploadMiddleware');
const path = require('path');

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM product');
  res.json(result.rows);
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM product WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(result.rows[0]);
});

// Create new product with image upload
const createProduct = asyncHandler(async (req, res) => {
  const { name, categoryId, sizes, descriptions, adminId } = req.body;
  
  // Handle uploaded files
  let picList = [];
  if (req.files && req.files.length > 0) {
    picList = req.files.map(file => `/uploads/products/${file.filename}`);
  }

  const query = `
    INSERT INTO product (name, category_id, sizes, descriptions, pics, admin_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    name,
    categoryId,
    Array.isArray(sizes) ? sizes : [sizes],
    Array.isArray(descriptions) ? descriptions : [descriptions],
    picList,
    adminId
  ]);

  res.status(201).json(result.rows[0]);
});

// Update product with image management
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, sizes, descriptions, adminId, keepExistingImages } = req.body;
  
  // Get current product to manage existing images
  const currentProduct = await pool.query('SELECT pics FROM product WHERE id = $1', [id]);
  if (currentProduct.rows.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  let picList = [];
  
  // Handle keeping existing images
  if (keepExistingImages === 'true' && currentProduct.rows[0].pics) {
    picList = [...currentProduct.rows[0].pics];
  } else if (currentProduct.rows[0].pics) {
    // Delete old images if not keeping them
    currentProduct.rows[0].pics.forEach(picPath => {
      const filename = path.basename(picPath);
      deleteFile(filename);
    });
  }
  
  // Add new uploaded files
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
    picList = [...picList, ...newImages];
    
    // Ensure maximum 2 images
    if (picList.length > 2) {
      // Remove excess images and delete files
      const excessImages = picList.slice(2);
      excessImages.forEach(picPath => {
        const filename = path.basename(picPath);
        deleteFile(filename);
      });
      picList = picList.slice(0, 2);
    }
  }

  const query = `
    UPDATE product
    SET name = $1, category_id = $2, sizes = $3, descriptions = $4, pics = $5, admin_id = $6
    WHERE id = $7
    RETURNING *;
  `;

  const result = await pool.query(query, [
    name,
    categoryId,
    Array.isArray(sizes) ? sizes : [sizes],
    Array.isArray(descriptions) ? descriptions : [descriptions],
    picList,
    adminId,
    id
  ]);

  res.json(result.rows[0]);
});

// Delete specific product image
const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageIndex } = req.params;
  
  const product = await pool.query('SELECT pics FROM product WHERE id = $1', [id]);
  if (product.rows.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  const pics = product.rows[0].pics || [];
  const imageIndexNum = parseInt(imageIndex);
  
  if (imageIndexNum < 0 || imageIndexNum >= pics.length) {
    res.status(400);
    throw new Error('Invalid image index');
  }

  // Delete the file
  const imageToDelete = pics[imageIndexNum];
  const filename = path.basename(imageToDelete);
  deleteFile(filename);

  // Remove from array
  const updatedPics = pics.filter((_, index) => index !== imageIndexNum);

  // Update database
  await pool.query('UPDATE product SET pics = $1 WHERE id = $2', [updatedPics, id]);

  res.json({ message: 'Image deleted successfully', pics: updatedPics });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get product images before deletion
  const product = await pool.query('SELECT pics FROM product WHERE id = $1', [id]);
  if (product.rows.length > 0 && product.rows[0].pics) {
    // Delete all associated image files
    product.rows[0].pics.forEach(picPath => {
      const filename = path.basename(picPath);
      deleteFile(filename);
    });
  }

  await pool.query('DELETE FROM product WHERE id = $1', [id]);

  res.json({ message: 'Product deleted successfully' });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage
};
