const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await pool.execute('SELECT id, name, email, number FROM customer');
  res.json(result[0]);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.execute('SELECT id, name, email, number FROM customer WHERE id = ?', [id]);

  if (result[0].length === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(result[0][0]);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, number, password } = req.body;

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
  if (number) {
    fields.push(`number = ?`);
    values.push(number);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    fields.push(`password = ?`);
    values.push(hashedPassword);
  }

  if (fields.length === 0) {
    res.status(400);
    throw new Error('No fields to update');
  }

  values.push(id);

  const query = `UPDATE customer SET ${fields.join(', ')} WHERE id = ?`;
  const result = await pool.execute(query, values);

  if (result[0].affectedRows === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Get the updated customer
  const updatedCustomer = await pool.execute('SELECT id, name, email, number FROM customer WHERE id = ?', [id]);
  res.json(updatedCustomer[0][0]);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.execute('DELETE FROM customer WHERE id = ?', [id]);

  res.json({ message: 'Customer deleted successfully' });
});

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
