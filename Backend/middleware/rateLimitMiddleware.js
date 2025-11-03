/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and DoS
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Prevents excessive requests to API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests (only count failed/suspicious ones)
  skip: (req, res) => res.statusCode < 400,
});

/**
 * Strict limiter for authentication endpoints
 * Prevents brute force password attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful authentication
  skipSuccessfulRequests: true,
});

/**
 * OTP verification rate limiter
 * Prevents OTP brute forcing
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Only 3 OTP verification attempts per 10 minutes
  message: {
    error: 'Too many OTP verification attempts. Please request a new OTP',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all OTP attempts
});

/**
 * Password reset request limiter
 * Prevents spam OTP generation
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 password reset requests per hour
  message: {
    error: 'Too many password reset requests. Please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Registration rate limiter
 * Prevents mass account creation
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 registrations per IP per hour
  message: {
    error: 'Too many accounts created from this IP. Please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * File upload rate limiter
 * Prevents file upload spam/DoS
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 file uploads per 15 minutes
  message: {
    error: 'Too many file uploads. Please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  registerLimiter,
  uploadLimiter
};
