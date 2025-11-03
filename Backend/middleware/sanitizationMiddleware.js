/**
 * XSS Sanitization Middleware
 * Prevents cross-site scripting attacks by sanitizing user input
 */

const DOMPurify = require('isomorphic-dompurify');

/**
 * Sanitize a single value
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Remove all HTML tags and scripts
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true, // Keep text content
    });
  }
  return value;
}

/**
 * Recursively sanitize an object or array
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object') {
        return sanitizeObject(item);
      }
      return sanitizeValue(item);
    });
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = sanitizeValue(value);
        }
      }
    }
    return sanitized;
  }

  return sanitizeValue(obj);
}

/**
 * Middleware to sanitize request body
 * Removes potentially malicious HTML/script content
 */
function sanitizeInput(req, res, next) {
  // ✅ SECURITY FIX: Skip sanitization for multipart/form-data (file uploads)
  // Multer will handle file uploads separately
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  // Sanitize request body for JSON and URL-encoded data
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Also sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * Helper function for manual sanitization in controllers
 */
function sanitize(input) {
  return sanitizeObject(input);
}

/**
 * Sanitize HTML but allow safe HTML tags
 * Useful for rich text content
 */
function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
}

module.exports = {
  sanitizeInput,
  sanitize,
  sanitizeHTML,
  sanitizeValue
};
