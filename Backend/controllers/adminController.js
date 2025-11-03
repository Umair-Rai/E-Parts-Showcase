const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
  const result = await pool.execute('SELECT id, name, email, role FROM admin');
  res.json(result[0]);
});

// Get admin by ID
const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.execute('SELECT id, name, email, role FROM admin WHERE id = ?', [id]);

  if (result[0].length === 0) {
    res.status(404);
    throw new Error('Admin not found');
  }

  res.json(result[0][0]);
});

// Update admin
const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  const fields = [];
  const values = [];

  if (name) {
    fields.push(`name = ?`);
    values.push(name);
  }
  if (email) {
    fields.push(`email = ?`);
    values.push(email);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    fields.push(`password = ?`);
    values.push(hashedPassword);
  }
  if (role) {
    fields.push(`role = ?`);
    values.push(role);
  }

  if (fields.length === 0) {
    res.status(400);
    throw new Error('No fields to update');
  }

  values.push(id);

  const query = `UPDATE admin SET ${fields.join(', ')} WHERE id = ?`;
  const result = await pool.execute(query, values);

  if (result[0].affectedRows === 0) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Get the updated admin
  const updatedAdmin = await pool.execute('SELECT id, name, email, role FROM admin WHERE id = ?', [id]);
  res.json(updatedAdmin[0][0]);
});

// Delete admin
const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.execute('DELETE FROM admin WHERE id = ?', [id]);
  res.json({ message: 'Admin deleted successfully' });
});

// Admin login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.execute('SELECT * FROM admin WHERE email = ?', [email]);
  const admin = result[0][0];

  if (!admin) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// Get dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get total counts
    const [
      productsResult,
      customersResult,
      categoriesResult
    ] = await Promise.all([
      // Total products
      pool.execute('SELECT COUNT(*) as count FROM product'),
      
      // Total customers
      pool.execute('SELECT COUNT(*) as count FROM customer'),
      
      // Total categories
      pool.execute('SELECT COUNT(*) as count FROM category')
    ]);

    const dashboardData = {
      totalProducts: parseInt(productsResult[0][0].count),
      totalCustomers: parseInt(customersResult[0][0].count),
      totalCategories: parseInt(categoriesResult[0][0].count)
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  login,
  getDashboardStats,
};
