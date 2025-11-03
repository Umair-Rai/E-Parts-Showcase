const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const { deleteFile } = require('../middleware/uploadMiddleware');
const { sanitizeValue } = require('../middleware/sanitizationMiddleware');
const path = require('path');

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
    const result = await pool.execute('SELECT * FROM product');
    res.json(result[0]);
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.execute('SELECT * FROM product WHERE id = ?', [id]);
    
    if (result[0].length === 0) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    res.json(result[0][0]);
});

// Create new product with image upload
const createProduct = asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;
    let { sizes, descriptions } = req.body;
    
    // ✅ SECURITY: Manually sanitize text fields (multipart data skips global sanitization)
    const sanitizedName = sanitizeValue(name);
    
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
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // ✅ SECURITY: Sanitize array items
    const sanitizedSizes = Array.isArray(sizes) ? sizes.map(s => sanitizeValue(s)) : [sanitizeValue(sizes)];
    const sanitizedDescriptions = Array.isArray(descriptions) ? descriptions.map(d => sanitizeValue(d)) : [sanitizeValue(descriptions)];

    const result = await pool.execute(query, [
        sanitizedName,
        categoryId,
        JSON.stringify(sanitizedSizes),
        JSON.stringify(sanitizedDescriptions),
        JSON.stringify(picList), // Convert array to JSON string for MySQL
        adminId
    ]);

    // Get the inserted product
    const insertedProduct = await pool.execute('SELECT * FROM product WHERE id = ?', [result[0].insertId]);
    res.status(201).json(insertedProduct[0][0]);
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
    
    // ✅ SECURITY: Manually sanitize text fields (multipart data skips global sanitization)
    const sanitizedName = sanitizeValue(name);
    
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
    const currentProduct = await pool.execute('SELECT pic FROM product WHERE id = ?', [id]);
    
    if (currentProduct[0].length === 0) {
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
    let currentImages = [];
    
    if (Array.isArray(currentProduct[0][0].pic)) {
        currentImages = currentProduct[0][0].pic;
    } else if (typeof currentProduct[0][0].pic === 'string') {
        try {
            currentImages = JSON.parse(currentProduct[0][0].pic);
        } catch (error) {
            console.error('Error parsing current images for update:', error);
            currentImages = [];
        }
    }
    
    const imagesToDelete = currentImages.filter(img => !picList.includes(img));
    imagesToDelete.forEach(picPath => {
        const filename = path.basename(picPath);
        deleteFile(filename);
    });

    // ✅ SECURITY: Sanitize array items
    const sanitizedSizes = Array.isArray(sizesArray) ? sizesArray.map(s => sanitizeValue(s)) : [sanitizeValue(sizesArray)];
    const sanitizedDescriptions = Array.isArray(descriptionsArray) ? descriptionsArray.map(d => sanitizeValue(d)) : [sanitizeValue(descriptionsArray)];

    // Update the database with JSON arrays
    await pool.execute(
        'UPDATE product SET name = ?, category_id = ?, sizes = ?, descriptions = ?, pic = ? WHERE id = ?',
        [sanitizedName, categoryId, JSON.stringify(sanitizedSizes), JSON.stringify(sanitizedDescriptions), JSON.stringify(picList), id]
    );
    
    // Get the updated product
    const updatedProduct = await pool.execute('SELECT * FROM product WHERE id = ?', [id]);
    res.json(updatedProduct[0][0]);
});

// Delete specific product image
const deleteProductImage = asyncHandler(async (req, res) => {
    const { id, imageIndex } = req.params;
    
    const product = await pool.execute('SELECT pic FROM product WHERE id = ?', [id]);
    
    if (product[0].length === 0) {
        res.status(404);
        throw new Error('Product not found');
    }

    const pics = [];
    
    if (Array.isArray(product[0][0].pic)) {
        pics = product[0][0].pic;
    } else if (typeof product[0][0].pic === 'string') {
        try {
            pics = JSON.parse(product[0][0].pic);
        } catch (error) {
            console.error('Error parsing pics for image deletion:', error);
            pics = [];
        }
    }
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
    await pool.execute('UPDATE product SET pic = ? WHERE id = ?', [JSON.stringify(updatedPics), id]);
    
    res.json({ message: 'Image deleted successfully', pics: updatedPics });
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get product images before deletion
    const product = await pool.execute('SELECT pic FROM product WHERE id = ?', [id]);
    
    if (product[0].length > 0 && product[0][0].pic) {
        // Delete all associated image files
        let pics = [];
        
        if (Array.isArray(product[0][0].pic)) {
            pics = product[0][0].pic;
        } else if (typeof product[0][0].pic === 'string') {
            try {
                pics = JSON.parse(product[0][0].pic);
            } catch (error) {
                console.error('Error parsing pics for deletion:', error);
                pics = [];
            }
        }
        
        pics.forEach(picPath => {
            const filename = path.basename(picPath);
            deleteFile(filename);
        });
    }

    await pool.execute('DELETE FROM product WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
});

// Create new product with mechanical seal attributes
const createProductWithMechanicalSeal = asyncHandler(async (req, res) => {
    console.log('🔧 Creating product with mechanical seal attributes');
    console.log('📝 Request body:', req.body);
    console.log('📁 Files:', req.files);
    
    let { name, categoryId, sizes, descriptions, mechanicalSealAttributes } = req.body;
    
    // ✅ SECURITY: Manually sanitize text fields (multipart data skips global sanitization)
    const sanitizedName = sanitizeValue(name);
    
    // Parse JSON strings if they come as strings from FormData
    if (typeof sizes === 'string') {
        try {
            sizes = JSON.parse(sizes);
        } catch (e) {
            res.status(400);
            throw new Error('Invalid sizes format');
        }
    }
    
    if (typeof descriptions === 'string') {
        try {
            descriptions = JSON.parse(descriptions);
        } catch (e) {
            res.status(400);
            throw new Error('Invalid descriptions format');
        }
    }
    
    if (typeof mechanicalSealAttributes === 'string') {
        try {
            mechanicalSealAttributes = JSON.parse(mechanicalSealAttributes);
        } catch (e) {
            res.status(400);
            throw new Error('Invalid mechanicalSealAttributes format');
        }
    }
    
    // Get admin ID from authenticated user (from JWT token)
    const adminId = req.user.id;
    
    console.log('📊 Parsed data:');
    console.log('  - name:', name);
    console.log('  - categoryId:', categoryId);
    console.log('  - sizes:', sizes);
    console.log('  - descriptions:', descriptions);
    console.log('  - mechanicalSealAttributes:', mechanicalSealAttributes);
    console.log('  - adminId:', adminId);

    // Handle uploaded files
    let picList = [];
    if (req.files) {
        const productImages = req.files.productImages || [];
        const images = req.files.images || [];
        const allFiles = [...productImages, ...images];
        
        if (allFiles.length > 0) {
            picList = allFiles.map(file => `/uploads/products/${file.filename}`);
        }
    }

    // Validate that sizes and descriptions arrays have the same length
    if (sizes.length !== descriptions.length) {
        res.status(400);
        throw new Error('Sizes and descriptions arrays must have the same length');
    }

    // Start transaction
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert into product table
        const productQuery = `
            INSERT INTO product (name, category_id, sizes, descriptions, pic, admin_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // ✅ SECURITY: Sanitize array items  
        const sanitizedSizes = Array.isArray(sizes) ? sizes.map(s => sanitizeValue(s)) : [sanitizeValue(sizes)];
        const sanitizedDescriptions = Array.isArray(descriptions) ? descriptions.map(d => sanitizeValue(d)) : [sanitizeValue(descriptions)];

        const productResult = await connection.execute(productQuery, [
            sanitizedName,
            categoryId,
            JSON.stringify(sanitizedSizes),
            JSON.stringify(sanitizedDescriptions),
            JSON.stringify(picList),
            adminId
        ]);

        const productId = productResult[0].insertId;

        // Insert mechanical seal attributes for each product size if provided
        if (mechanicalSealAttributes && mechanicalSealAttributes.length > 0) {
            for (let i = 0; i < sizes.length; i++) {
                const productSize = sizes[i];
                const mechanicalAttr = mechanicalSealAttributes[i];

                if (mechanicalAttr) {
                    // Validate mechanical seal attributes
                    if (!mechanicalAttr.sizes || !mechanicalAttr.descriptions || 
                        !mechanicalAttr.material || !mechanicalAttr.temperature || 
                        !mechanicalAttr.pressure || !mechanicalAttr.speed) {
                        throw new Error(`All mechanical seal attributes are required for size: ${productSize}`);
                    }

                    // Validate that mechanical seal sizes and descriptions have the same length
                    if (mechanicalAttr.sizes.length !== mechanicalAttr.descriptions.length) {
                        throw new Error(`Mechanical seal sizes and descriptions must have the same length for product size: ${productSize}`);
                    }

                    const mechanicalSealQuery = `
                        INSERT INTO mechanical_seal_attributes 
                        (product_id, product_size, sizes, descriptions, material, temperature, pressure, speed)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    await connection.execute(mechanicalSealQuery, [
                        productId,
                        productSize,
                        JSON.stringify(mechanicalAttr.sizes),
                        JSON.stringify(mechanicalAttr.descriptions),
                        mechanicalAttr.material,
                        mechanicalAttr.temperature,
                        mechanicalAttr.pressure,
                        mechanicalAttr.speed
                    ]);
                }
            }
        }

        await connection.commit();

        // Fetch the complete product with mechanical seal attributes
        const completeProductQuery = `
            SELECT p.*, msa.* 
            FROM product p
            LEFT JOIN mechanical_seal_attributes msa ON p.id = msa.product_id
            WHERE p.id = ?
        `;
        
        const completeResult = await pool.execute(completeProductQuery, [productId]);
        
        // Get the created product
        const productData = await pool.execute('SELECT * FROM product WHERE id = ?', [productId]);
        const product = productData[0][0];
        
        // Group mechanical seal attributes by product_size
        const mechanicalSealData = {};
        
        completeResult[0].forEach(row => {
            if (row.product_size) {
                // Handle JSON parsing for MySQL compatibility
                let sizesArray = [];
                let descriptionsArray = [];
                
                if (row.sizes) {
                    if (Array.isArray(row.sizes)) {
                        sizesArray = row.sizes;
                    } else if (typeof row.sizes === 'string') {
                        try {
                            sizesArray = JSON.parse(row.sizes);
                        } catch (error) {
                            console.error('Error parsing sizes:', error);
                            sizesArray = [];
                        }
                    }
                }
                
                if (row.descriptions) {
                    if (Array.isArray(row.descriptions)) {
                        descriptionsArray = row.descriptions;
                    } else if (typeof row.descriptions === 'string') {
                        try {
                            descriptionsArray = JSON.parse(row.descriptions);
                        } catch (error) {
                            console.error('Error parsing descriptions:', error);
                            descriptionsArray = [];
                        }
                    }
                }
                
                mechanicalSealData[row.product_size] = {
                    id: row.id,
                    product_size: row.product_size,
                    sizes: sizesArray,
                    descriptions: descriptionsArray,
                    material: row.material,
                    temperature: row.temperature,
                    pressure: row.pressure,
                    speed: row.speed
                };
            }
        });

        res.status(201).json({
            product,
            mechanicalSealAttributes: mechanicalSealData
        });

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    createProductWithMechanicalSeal,
    updateProduct,
    deleteProduct,
    deleteProductImage
};
