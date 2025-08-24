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
    const { name, categoryId } = req.body;
    let { sizes, descriptions } = req.body;
    
    // Get admin ID from authenticated user (from JWT token)
    const adminId = req.user.id;

    // Parse JSON strings
    if (typeof sizes === 'string') {
        try {
            sizes = JSON.parse(sizes);
        } catch (e) {
            sizes = [sizes];
        }
    }

    if (typeof descriptions === 'string') {
        try {
            descriptions = JSON.parse(descriptions);
        } catch (e) {
            descriptions = [descriptions];
        }
    }

    // ✅ FIX: Handle uploaded files correctly for multer.fields()
    let picList = [];
    if (req.files) {
        // Collect files from both 'productImages' and 'images' fields
        const productImages = req.files.productImages || [];
        const images = req.files.images || [];
        
        // Combine all uploaded files
        const allFiles = [...productImages, ...images];
        
        if (allFiles.length > 0) {
            picList = allFiles.map(file => `/uploads/products/${file.filename}`);
        }
    }

    // Debug logging
    console.log('Files received:', req.files);
    console.log('Generated picList:', picList);

    const query = `
        INSERT INTO product (name, category_id, sizes, descriptions, pic, admin_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;

    const result = await pool.query(query, [
        name,
        categoryId,
        Array.isArray(sizes) ? sizes : [sizes],
        Array.isArray(descriptions) ? descriptions : [descriptions],
        picList, // This will now contain the correct image URLs
        adminId
    ]);

    res.status(201).json(result.rows[0]);
});

// Update product with image management
// Add this at the beginning of updateProduct function
// In the updateProduct function, handle the arrays properly
const updateProduct = asyncHandler(async (req, res) => {
    console.log('=== UPDATE PRODUCT REQUEST ===');
    console.log('Product ID:', req.params.id);
    console.log('Request body:', req.body);
    
    const { id } = req.params;
    const { name, categoryId, sizes, descriptions, existingImages } = req.body;
    
    // Parse sizes and descriptions if they come as JSON strings
    let sizesArray = sizes;
    let descriptionsArray = descriptions;
    
    if (typeof sizes === 'string') {
        try {
            sizesArray = JSON.parse(sizes);
        } catch (e) {
            // If parsing fails, treat as single item array
            sizesArray = [sizes];
        }
    }
    
    if (typeof descriptions === 'string') {
        try {
            descriptionsArray = JSON.parse(descriptions);
        } catch (e) {
            // If parsing fails, treat as single item array
            descriptionsArray = [descriptions];
        }
    }
    
    // Get current product
    const currentProduct = await pool.query('SELECT pic FROM product WHERE id = $1', [id]);
    
    if (currentProduct.rows.length === 0) {
        res.status(404);
        throw new Error('Product not found');
    }

    let picList = [];
    
    // Handle existing images that user wants to keep
    if (existingImages) {
        try {
            const parsedExisting = JSON.parse(existingImages);
            picList = [...parsedExisting];
        } catch (e) {
            console.error('Failed to parse existingImages:', e);
        }
    }
    
    // ✅ FIXED: Handle new uploaded images correctly for multer.fields()
    if (req.files) {
        const allFiles = [];
        
        // Collect files from both possible field names
        if (req.files.productImages) {
            allFiles.push(...req.files.productImages);
        }
        if (req.files.images) {
            allFiles.push(...req.files.images);
        }
        
        if (allFiles.length > 0) {
            const newImages = allFiles.map(file => `/uploads/products/${file.filename}`);
            picList = [...picList, ...newImages];
        }
    }
    
    // Validate image count
    if (picList.length === 0) {
        res.status(400);
        throw new Error('At least one image is required');
    }
    
    if (picList.length > 2) {
        res.status(400);
        throw new Error('Maximum 2 images allowed');
    }
    
    // Delete images that are no longer needed
    const currentImages = currentProduct.rows[0].pic || [];
    const imagesToDelete = currentImages.filter(img => !picList.includes(img));
    imagesToDelete.forEach(picPath => {
        const filename = path.basename(picPath);
        deleteFile(filename);
    });

    // Update the database with arrays
    const result = await pool.query(
        'UPDATE product SET name = $1, category_id = $2, sizes = $3, descriptions = $4, pic = $5 WHERE id = $6 RETURNING *',
        [name, categoryId, sizesArray, descriptionsArray, picList, id]
    );
    
    res.json(result.rows[0]);
});

// Delete specific product image
const deleteProductImage = asyncHandler(async (req, res) => {
    const { id, imageIndex } = req.params;
    
    const product = await pool.query('SELECT pic FROM product WHERE id = $1', [id]);
    
    if (product.rows.length === 0) {
        res.status(404);
        throw new Error('Product not found');
    }

    const pics = product.rows[0].pic || [];
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
    await pool.query('UPDATE product SET pic = $1 WHERE id = $2', [updatedPics, id]);
    
    res.json({ message: 'Image deleted successfully', pics: updatedPics });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get product images before deletion
    const product = await pool.query('SELECT pic FROM product WHERE id = $1', [id]);
    
    if (product.rows.length > 0 && product.rows[0].pic) {
        // Delete all associated image files
        product.rows[0].pic.forEach(picPath => {
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
