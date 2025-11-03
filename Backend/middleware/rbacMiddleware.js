/**
 * Role-Based Access Control (RBAC) Middleware
 * Protects routes based on user roles
 */

/**
 * Middleware to require specific roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized: Authentication required' 
      });
    }

    // Check if user has a role
    if (!req.user.role) {
      return res.status(403).json({ 
        error: 'Forbidden: No role assigned to user' 
      });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`Access denied for user ${req.user.id} with role ${req.user.role}. Required: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    // User has required role, proceed
    next();
  };
}

/**
 * Middleware to check resource ownership
 * Allows users to access only their own resources, or admins to access any
 * @param {string} paramName - Name of the parameter containing the user ID (default: 'id')
 * @returns {Function} Express middleware function
 */
function requireOwnership(paramName = 'id') {
  return (req, res, next) => {
    const resourceUserId = parseInt(req.params[paramName]) || req.params[paramName];
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Allow admins and super admins to access any resource
    if (userRole === 'admin' || userRole === 'super admin') {
      return next();
    }

    // Check if user is accessing their own resource
    if (resourceUserId !== currentUserId) {
      console.warn(`IDOR attempt: User ${currentUserId} tried to access resource of user ${resourceUserId}`);
      return res.status(403).json({ 
        error: 'Forbidden: You can only access your own resources' 
      });
    }

    next();
  };
}

/**
 * Middleware to check cart ownership
 * Special case for cart where userId might be in different locations
 */
function requireCartOwnership(req, res, next) {
  // Get userId from params or body
  const resourceUserId = parseInt(req.params.userId) || parseInt(req.body.userId);
  const currentUserId = req.user.id;
  const userRole = req.user.role;

  // Allow admins and super admins to access any cart
  if (userRole === 'admin' || userRole === 'super admin') {
    return next();
  }

  // Check if user is accessing their own cart
  if (resourceUserId !== currentUserId) {
    console.warn(`IDOR attempt on cart: User ${currentUserId} tried to access cart of user ${resourceUserId}`);
    return res.status(403).json({ 
      error: 'Forbidden: You can only access your own cart' 
    });
  }

  next();
}

module.exports = {
  requireRole,
  requireOwnership,
  requireCartOwnership
};
