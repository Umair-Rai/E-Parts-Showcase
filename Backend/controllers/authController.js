const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, number } = req.body;  // Add number here

  const userCheckQuery = role === 'admin'
    ? 'SELECT * FROM admin WHERE email = $1'
    : 'SELECT * FROM customer WHERE email = $1';

  const userCheckResult = await pool.query(userCheckQuery, [email]);
  if (userCheckResult.rows.length > 0) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === 'admin') {
    const insertQuery =
      'INSERT INTO admin (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(insertQuery, [name, email, hashedPassword, role]);
    const user = result.rows[0];
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } else if (role === 'customer') {
    const insertQuery =
      'INSERT INTO customer (name, email, number, password) VALUES ($1, $2, $3, $4) RETURNING *';  // added number
    const result = await pool.query(insertQuery, [name, email, number, hashedPassword]);  // add number param
    const user = result.rows[0];
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: 'customer' });
  } else {
    res.status(400);
    throw new Error('Invalid role');
  }
});


const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const userQuery = role === 'admin'
    ? 'SELECT * FROM admin WHERE email = $1'
    : 'SELECT * FROM customer WHERE email = $1';

  const userResult = await pool.query(userQuery, [email]);
  const user = userResult.rows[0];
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, role: role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token });
});

const me = asyncHandler(async (req, res) => {
  const { id, role } = req.user;

  let userQuery = '';
  if (role === 'admin') userQuery = 'SELECT id, name, email, role FROM admin WHERE id = $1';
  else if (role === 'customer') userQuery = 'SELECT id, name, email FROM customer WHERE id = $1';
  else throw new Error('Invalid role');

  const userResult = await pool.query(userQuery, [id]);
  if (userResult.rows.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(userResult.rows[0]);
});

module.exports = { register, login, me };
