const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const { deleteFile } = require('../middleware/uploadMiddleware');
const { sanitizeValue } = require('../middleware/sanitizationMiddleware');
const path = require('path');

// 📌 Helper: Ensure value is always an array
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map((v) => v.trim());
};

const getAllCategories = asyncHandler(async (req, res) => {
  const result = await pool.execute('SELECT * FROM category');
  
  // Handle JSON fields for MySQL compatibility
  const categories = result[0].map(category => {
    let picArray = [];
    
    if (category.pic) {
      if (Array.isArray(category.pic)) {
        // Already parsed by MySQL
        picArray = category.pic;
      } else if (typeof category.pic === 'string') {
        try {
          // Try to parse as JSON
          picArray = JSON.parse(category.pic);
        } catch (error) {
          // If JSON parsing fails, try to handle as string
          if (category.pic.startsWith('{') && category.pic.endsWith('}')) {
            // Handle Postgres TEXT[] format: {"url1","url2"}
            picArray = category.pic
              .replace(/[{}"]/g, '')
              .split(',')
              .map(url => url.trim())
              .filter(url => url.length > 0);
          } else {
            // Treat as single image path
            picArray = [category.pic];
          }
        }
      }
    }
    
    return {
      ...category,
      pic: picArray,
      // ✅ FIX: Ensure special_category is always a boolean
      special_category: Boolean(category.special_category)
    };
  });
  
  res.json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.execute('SELECT * FROM category WHERE id = ?', [id]);

  if (result[0].length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Handle JSON fields for MySQL compatibility
  let picArray = [];
  if (result[0][0].pic) {
    if (Array.isArray(result[0][0].pic)) {
      // Already parsed by MySQL
      picArray = result[0][0].pic;
    } else if (typeof result[0][0].pic === 'string') {
      try {
        picArray = JSON.parse(result[0][0].pic);
      } catch (error) {
        if (result[0][0].pic.startsWith('{') && result[0][0].pic.endsWith('}')) {
          picArray = result[0][0].pic
            .replace(/[{}"]/g, '')
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        } else {
          picArray = [result[0][0].pic];
        }
      }
    }
  }

  const category = {
    ...result[0][0],
    pic: picArray,
    // ✅ FIX: Ensure special_category is always a boolean
    special_category: Boolean(result[0][0].special_category)
  };

  res.json(category);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, specialCategory } = req.body;
  
  // ✅ SECURITY: Manually sanitize text fields (multipart data skips global sanitization)
  const sanitizedName = sanitizeValue(name);
  
  // Handle uploaded files
  const picArray = req.files ? req.files.map(file => `/uploads/categories/${file.filename}`) : [];
  
  const query =
    'INSERT INTO category (name, pic, special_category) VALUES (?, ?, ?)';

  const result = await pool.execute(query, [sanitizedName, JSON.stringify(picArray), specialCategory === 'true']);
  
  // Get the created category
  const createdCategory = await pool.execute('SELECT * FROM category WHERE id = ?', [result[0].insertId]);
  
  // Handle JSON fields for MySQL compatibility
  let parsedPicArray = [];
  if (createdCategory[0][0].pic) {
    if (Array.isArray(createdCategory[0][0].pic)) {
      // Already parsed by MySQL
      parsedPicArray = createdCategory[0][0].pic;
    } else if (typeof createdCategory[0][0].pic === 'string') {
      try {
        parsedPicArray = JSON.parse(createdCategory[0][0].pic);
      } catch (error) {
        if (createdCategory[0][0].pic.startsWith('{') && createdCategory[0][0].pic.endsWith('}')) {
          parsedPicArray = createdCategory[0][0].pic
            .replace(/[{}"]/g, '')
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        } else {
          parsedPicArray = [createdCategory[0][0].pic];
        }
      }
    }
  }
  
  const category = {
    ...createdCategory[0][0],
    pic: parsedPicArray,
    // ✅ FIX: Ensure special_category is always a boolean
    special_category: Boolean(createdCategory[0][0].special_category)
  };
  
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, specialCategory, existingImages } = req.body;

  console.log('📝 Update Category Request:', {
    id,
    name,
    specialCategory,
    existingImages: existingImages?.substring(0, 100), // Log first 100 chars
    hasFiles: !!req.files,
    fileCount: req.files?.length || 0
  });

  // ✅ SECURITY: Manually sanitize text fields (multipart data skips global sanitization)
  const sanitizedName = sanitizeValue(name);

  // Get current category to access existing images
  const currentCategory = await pool.execute('SELECT pic FROM category WHERE id = ?', [id]);
  
  if (currentCategory[0].length === 0) {
    res.status(404);
    throw new Error('Category not found');
  }

  // ✅ FIX: Robust parsing of existingImages
  let existingImagesArray = [];
  if (existingImages) {
    try {
      // First, try to parse as JSON
      const parsed = JSON.parse(existingImages);
      existingImagesArray = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing existingImages:', error);
      console.error('existingImages value:', existingImages);
      
      // If JSON parsing fails, treat as empty array
      existingImagesArray = [];
    }
  }
  
  console.log('Parsed existingImages:', existingImagesArray);

  // Handle new uploaded files
  const newImagesArray = req.files ? req.files.map(file => `/uploads/categories/${file.filename}`) : [];
  
  // Combine existing images (that should be kept) with new uploaded images
  const finalPicArray = [...existingImagesArray, ...newImagesArray];
  
  // Delete images that are no longer needed
  // ✅ FIX: Handle both JSON string and already-parsed array from MySQL
  let currentImages = [];
  const currentPic = currentCategory[0][0].pic;
  
  if (Array.isArray(currentPic)) {
    // Already parsed by MySQL
    currentImages = currentPic;
  } else if (typeof currentPic === 'string') {
    try {
      currentImages = JSON.parse(currentPic);
    } catch (error) {
      console.error('Error parsing current images:', error);
      currentImages = [];
    }
  }
  
  const imagesToDelete = currentImages.filter(img => !finalPicArray.includes(img));
  imagesToDelete.forEach(picPath => {
    const filename = path.basename(picPath);
    deleteFile(filename);
  });
  
  // ✅ FIX: Handle boolean conversion properly
  const isSpecialCategory = specialCategory === 'true' || specialCategory === true;
  
  console.log('Final update values:', {
    name: sanitizedName,
    picArray: finalPicArray,
    specialCategory: isSpecialCategory,
    imagesToDelete: imagesToDelete
  });

  const query =
    'UPDATE category SET name = ?, pic = ?, special_category = ? WHERE id = ?';

  await pool.execute(query, [sanitizedName, JSON.stringify(finalPicArray), isSpecialCategory, id]);
  
  // Get the updated category
  const updatedCategory = await pool.execute('SELECT * FROM category WHERE id = ?', [id]);
  
  // Handle JSON fields for MySQL compatibility
  let parsedPicArray = [];
  if (updatedCategory[0][0].pic) {
    if (Array.isArray(updatedCategory[0][0].pic)) {
      // Already parsed by MySQL
      parsedPicArray = updatedCategory[0][0].pic;
    } else if (typeof updatedCategory[0][0].pic === 'string') {
      try {
        parsedPicArray = JSON.parse(updatedCategory[0][0].pic);
      } catch (error) {
        if (updatedCategory[0][0].pic.startsWith('{') && updatedCategory[0][0].pic.endsWith('}')) {
          parsedPicArray = updatedCategory[0][0].pic
            .replace(/[{}"]/g, '')
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
        } else {
          parsedPicArray = [updatedCategory[0][0].pic];
        }
      }
    }
  }
  
  // ✅ FIX: Ensure special_category is returned as boolean
  const category = {
    ...updatedCategory[0][0],
    pic: parsedPicArray,
    special_category: Boolean(updatedCategory[0][0].special_category)
  };
  
  console.log('✅ Category updated successfully:', category);
  
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.execute('DELETE FROM category WHERE id = ?', [id]);

  res.json({ message: 'Category deleted successfully' });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
