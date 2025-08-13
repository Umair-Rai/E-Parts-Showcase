const asyncHandler = require('express-async-handler');
const pool = require('../config/db');

const getAllAdmins = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM admin');
  res.json(result.rows);
});

const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT id, name, email, role FROM admin WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Admin not found');
  }

  res.json(result.rows[0]);
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  if (name) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (email) {
    fields.push(`email = $${idx++}`);
    values.push(email);
  }
  if (password) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    fields.push(`password = $${idx++}`);
    values.push(hashedPassword);
  }
  if (role) {
    fields.push(`role = $${idx++}`);
    values.push(role);
  }

  if (fields.length === 0) {
    res.status(400);
    throw new Error('No fields to update');
  }

  values.push(id);

  const query = `UPDATE admin SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role`;
  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Admin not found');
  }

  res.json(result.rows[0]);
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM admin WHERE id = $1', [id]);

  res.json({ message: 'Admin deleted successfully' });
});

module.exports = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
