const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const productsDir = path.join(__dirname, '../uploads/products');
const categoriesDir = path.join(__dirname, '../uploads/categories');

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}
if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}

// Configure storage for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// Configure storage for categories
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoriesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = 'category-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// ✅ SECURITY: Enhanced file filter with strict validation
const fileFilter = (req, file, cb) => {
  // Only allow specific image types (removed webp for security - can contain scripts)
  const allowedTypes = /jpeg|jpg|png|gif/;
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.includes(file.mimetype.toLowerCase());

  // Additional security checks
  // 1. Prevent path traversal in filename
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename: Path traversal detected'));
  }

  // 2. Check file extension matches mime type
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif). File type mismatch detected.'));
  }
};

// ✅ SECURITY: Stricter limits and validation
const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 2, // Maximum 2 files
    fields: 10, // Limit number of non-file fields
    fieldSize: 1 * 1024 * 1024 // 1MB per field value
  },
  fileFilter: fileFilter
});

// ✅ SECURITY: Stricter limits and validation
const categoryUpload = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 2, // Maximum 2 files
    fields: 10, // Limit number of non-file fields
    fieldSize: 1 * 1024 * 1024 // 1MB per field value
  },
  fileFilter: fileFilter
});

const uploadCategoryImages = categoryUpload.array('images', 2);
const uploadProductImages = productUpload.fields([
  { name: 'productImages', maxCount: 2 },
  { name: 'images', maxCount: 2 },
]);
// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  console.error('Upload error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Maximum 2 images allowed per product',
        code: 'FILE_COUNT_LIMIT'
      });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File size too large. Maximum 5MB per image',
        code: 'FILE_SIZE_LIMIT'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected file field. Use "productImages" or "images"',
        code: 'UNEXPECTED_FIELD'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({ 
      error: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected upload error:', error);
  next(error);
};

// Helper function to delete files
const deleteFile = (filename) => {
  // Determine the correct directory based on filename
  let filePath;
  if (filename.includes('category-')) {
    filePath = path.join(categoriesDir, filename);
  } else {
    filePath = path.join(productsDir, filename);
  }
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  uploadProductImages,
  uploadCategoryImages,
  handleUploadError,
  deleteFile
};