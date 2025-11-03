const asyncHandler = require('express-async-handler');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, number } = req.body;  // Add number here

  const userCheckQuery = (role === 'admin' || role === 'super admin')
    ? 'SELECT * FROM admin WHERE email = ?'
    : 'SELECT * FROM customer WHERE email = ?';

  const userCheckResult = await pool.execute(userCheckQuery, [email]);
  if (userCheckResult[0].length > 0) {
    res.status(400);
    // ✅ SECURITY FIX: Generic error message to prevent user enumeration
    throw new Error('Registration failed. Please check your information and try again');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === 'admin' || role === 'super admin') {
    const insertQuery =
      'INSERT INTO admin (name, email, password, role) VALUES (?, ?, ?, ?)';
    const result = await pool.execute(insertQuery, [name, email, hashedPassword, role]);
    const user = { id: result[0].insertId, name, email, role };
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } else if (role === 'customer') {
    const insertQuery =
      'INSERT INTO customer (name, email, number, password) VALUES (?, ?, ?, ?)';
    const result = await pool.execute(insertQuery, [name, email, number, hashedPassword]);
    const user = { id: result[0].insertId, name, email, number };
    res.status(201).json({ id: user.id, name: user.name, email: user.email, number: user.number, role: 'customer' });
  } else {
    res.status(400);
    throw new Error('Invalid role');
  }
});


const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const userQuery = (role === 'admin' || role === 'super admin')
    ? 'SELECT * FROM admin WHERE email = ?'
    : 'SELECT * FROM customer WHERE email = ?';

  const userResult = await pool.execute(userQuery, [email]);
  const user = userResult[0][0];
  
  // ✅ SECURITY FIX: Always compare password even if user doesn't exist to prevent timing attacks
  const dummyHash = '$2a$10$dummyHashToPreventTimingAttacks.......................';
  const passwordToCompare = user ? user.password : dummyHash;
  const isMatch = await bcrypt.compare(password, passwordToCompare);
  
  if (!user || !isMatch) {
    res.status(401);
    // Generic error message to prevent enumeration
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ 
    token, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      number: user.number || null, // Include number for customers, null for admins
      role: user.role
    }
  });
});

const me = asyncHandler(async (req, res) => {
  const { id, role } = req.user;

  let userQuery = '';
  // ✅ FIXED: Handle both 'admin' and 'super admin' roles
  if (role === 'admin' || role === 'super admin') {
    userQuery = 'SELECT id, name, email, role FROM admin WHERE id = ?';
  } else if (role === 'customer') {
    userQuery = 'SELECT id, name, email, number FROM customer WHERE id = ?';
  } else {
    throw new Error('Invalid role');
  }

  const userResult = await pool.execute(userQuery, [id]);
  if (userResult[0].length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(userResult[0][0]);
});

// Forgot Password - Send OTP
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, userType = 'customer' } = req.body;

  // Check if user exists
  const userQuery = userType === 'admin'
    ? 'SELECT * FROM admin WHERE email = ?'
    : 'SELECT * FROM customer WHERE email = ?';

  const userResult = await pool.execute(userQuery, [email]);
  if (userResult[0].length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Delete any existing OTP tokens for this email
  await pool.execute('DELETE FROM password_reset_tokens WHERE email = ?', [email]);

  // Store OTP in database
  await pool.execute(
    'INSERT INTO password_reset_tokens (email, otp, expires_at, user_type) VALUES (?, ?, ?, ?)',
    [email, otp, expiresAt, userType]
  );

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otp);

  res.json({ 
    message: emailResult.developmentMode 
      ? 'OTP generated successfully (check console for OTP)'
      : 'OTP sent successfully to your email',
    expiresIn: '10 minutes',
    developmentMode: emailResult.developmentMode || false
  });
});

// Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find valid OTP token
  const otpResult = await pool.execute(
    'SELECT * FROM password_reset_tokens WHERE email = ? AND otp = ? AND expires_at > NOW() AND used = FALSE',
    [email, otp]
  );

  if (otpResult[0].length === 0) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Mark OTP as used
  await pool.execute(
    'UPDATE password_reset_tokens SET used = TRUE WHERE email = ? AND otp = ?',
    [email, otp]
  );

  res.json({ message: 'OTP verified successfully' });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword, userType = 'customer' } = req.body;

  // Verify OTP again (double check)
  const otpResult = await pool.execute(
    'SELECT * FROM password_reset_tokens WHERE email = ? AND otp = ? AND used = TRUE',
    [email, otp]
  );

  if (otpResult[0].length === 0) {
    res.status(400);
    throw new Error('Invalid OTP or OTP not verified');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in appropriate table
  const updateQuery = userType === 'admin'
    ? 'UPDATE admin SET password = ? WHERE email = ?'
    : 'UPDATE customer SET password = ? WHERE email = ?';

  await pool.execute(updateQuery, [hashedPassword, email]);

  // Clean up used OTP tokens for this email
  await pool.execute('DELETE FROM password_reset_tokens WHERE email = ?', [email]);

  res.json({ message: 'Password reset successfully' });
});

module.exports = { register, login, me, forgotPassword, verifyOTP, resetPassword };
