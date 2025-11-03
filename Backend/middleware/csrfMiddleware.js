/**
 * CSRF Protection Middleware
 * Custom implementation (csurf is deprecated)
 */

const crypto = require('crypto');

// Store for CSRF tokens (in production, use Redis or database)
const tokenStore = new Map();

// Token expiry time (15 minutes)
const TOKEN_EXPIRY = 15 * 60 * 1000;

/**
 * Generate CSRF token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Cleanup expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

/**
 * Middleware to generate and send CSRF token
 */
function getCsrfToken(req, res) {
  const token = generateToken();
  const expiresAt = Date.now() + TOKEN_EXPIRY;
  
  // Store token with user ID if authenticated
  const userId = req.user?.id || 'anonymous';
  tokenStore.set(token, {
    userId,
    expiresAt,
    used: false
  });
  
  res.json({
    csrfToken: token,
    expiresIn: TOKEN_EXPIRY / 1000 // seconds
  });
}

/**
 * Middleware to verify CSRF token
 * Apply this to all state-changing routes (POST, PUT, DELETE)
 */
function verifyCsrfToken(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!token) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'Please include CSRF token in X-CSRF-Token header or _csrf field'
    });
  }

  // Verify token exists and is valid
  const tokenData = tokenStore.get(token);

  if (!tokenData) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token is invalid or expired'
    });
  }

  // Check if token is expired
  if (Date.now() > tokenData.expiresAt) {
    tokenStore.delete(token);
    return res.status(403).json({
      error: 'CSRF token expired',
      message: 'Please request a new CSRF token'
    });
  }

  // Check if token was already used (one-time use)
  if (tokenData.used) {
    return res.status(403).json({
      error: 'CSRF token already used',
      message: 'Please request a new CSRF token'
    });
  }

  // Verify token belongs to current user (if authenticated)
  if (req.user && tokenData.userId !== req.user.id && tokenData.userId !== 'anonymous') {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      message: 'Token does not belong to current user'
    });
  }

  // Mark token as used (one-time use for critical operations)
  // For regular operations, you might want to comment this out
  tokenData.used = true;

  next();
}

/**
 * Optional: More lenient CSRF for regular operations
 * Doesn't mark token as used, allows reuse within expiry period
 */
function verifyCsrfTokenReusable(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!token) {
    return res.status(403).json({
      error: 'CSRF token missing'
    });
  }

  const tokenData = tokenStore.get(token);

  if (!tokenData || Date.now() > tokenData.expiresAt) {
    return res.status(403).json({
      error: 'Invalid or expired CSRF token'
    });
  }

  // Don't mark as used - allow reuse
  next();
}

module.exports = {
  getCsrfToken,
  verifyCsrfToken,
  verifyCsrfTokenReusable
};
