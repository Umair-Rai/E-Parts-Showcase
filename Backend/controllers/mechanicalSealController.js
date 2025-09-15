const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

// Get mechanical seal attributes by product ID
const getMechanicalSealAttributesByProductId = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const query = `
        SELECT * FROM mechanical_seal_attributes 
        WHERE product_id = $1
    `;

    const result = await pool.query(query, [productId]);

    // Instead of throwing an error, return null or empty object
    if (result.rows.length === 0) {
        return res.json(null); // or res.json({})
    }

    res.json(result.rows[0]);
});

const createMechanicalSealAttributes = asyncHandler(async (req, res) => {
    const { productId,sizes, descriptions, material, temperature, pressure, speed } = req.body;

    if (!productId ||!sizes ||!descriptions ||!material || !temperature || !pressure || !speed) {
        res.status(400);
        throw new Error('All mechanical seal attributes are required');
    }

    const query = `
        INSERT INTO mechanical_seal_attributes 
        (product_id,sizes, descriptions, material, temperature, pressure, speed)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const result = await pool.query(query, [
        productId,
        Array.isArray(sizes) ? sizes : [sizes],
        Array.isArray(descriptions) ? descriptions : [descriptions],
        material,
        temperature,
        pressure,
        speed
    ]);

    res.status(201).json(result.rows[0]);
});

module.exports = {
    getMechanicalSealAttributesByProductId,
    createMechanicalSealAttributes
};
