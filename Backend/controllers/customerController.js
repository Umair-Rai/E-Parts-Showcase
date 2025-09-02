const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT id, name, email, number FROM customer');
  res.json(result.rows);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT id, name, email, number FROM customer WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(result.rows[0]);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, number, password } = req.body;

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
  if (number) {
    fields.push(`number = $${idx++}`);
    values.push(number);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    fields.push(`password = $${idx++}`);
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    res.status(400);
    throw new Error('No fields to update');
  }

  values.push(id);

  const query = `UPDATE customer SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, number`;
  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(result.rows[0]);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM customer WHERE id = $1', [id]);

  res.json({ message: 'Customer deleted successfully' });
});

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
