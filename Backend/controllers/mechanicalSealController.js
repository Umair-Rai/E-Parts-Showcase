const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

// Get mechanical seal attributes by product ID
const getMechanicalSealAttributesByProductId = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const query = `
        SELECT * FROM mechanical_seal_attributes 
        WHERE product_id = ?
        ORDER BY product_size
    `;

    const result = await pool.execute(query, [productId]);

    if (result[0].length === 0) {
        return res.json([]);
    }

    // Group by product_size for better frontend handling
    const groupedAttributes = {};
    result[0].forEach(row => {
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
        
        groupedAttributes[row.product_size] = {
            ...row,
            sizes: sizesArray,
            descriptions: descriptionsArray
        };
    });

    res.json(groupedAttributes);
});

const createMechanicalSealAttributes = asyncHandler(async (req, res) => {
    const { productId, productSize, sizes, descriptions, material, temperature, pressure, speed } = req.body;

    if (!productId || !productSize || !sizes || !descriptions || !material || !temperature || !pressure || !speed) {
        res.status(400);
        throw new Error('All mechanical seal attributes are required');
    }

    // Validate that sizes and descriptions arrays have the same length
    if (sizes.length !== descriptions.length) {
        res.status(400);
        throw new Error('Sizes and descriptions arrays must have the same length');
    }

    const query = `
        INSERT INTO mechanical_seal_attributes 
        (product_id, product_size, sizes, descriptions, material, temperature, pressure, speed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await pool.execute(query, [
        productId,
        productSize,
        JSON.stringify(Array.isArray(sizes) ? sizes : [sizes]),
        JSON.stringify(Array.isArray(descriptions) ? descriptions : [descriptions]),
        material,
        temperature,
        pressure,
        speed
    ]);

    // Get the created attributes
    const createdAttributes = await pool.execute('SELECT * FROM mechanical_seal_attributes WHERE id = ?', [result[0].insertId]);
    const attributes = createdAttributes[0][0];
    attributes.sizes = JSON.parse(attributes.sizes);
    attributes.descriptions = JSON.parse(attributes.descriptions);
    
    res.status(201).json(attributes);
});

module.exports = {
    getMechanicalSealAttributesByProductId,
    createMechanicalSealAttributes
};
