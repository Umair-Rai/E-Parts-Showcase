const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const mechanicalSealRoutes = require('./routes/mechanicalSealRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { getCsrfToken } = require('./middleware/csrfMiddleware');
const { sanitizeInput } = require('./middleware/sanitizationMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ SECURITY: Validate JWT secret on startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('❌ SECURITY ERROR: JWT_SECRET must be at least 32 characters long');
  console.error('   Add a strong JWT_SECRET to your .env file');
  process.exit(1);
}

// Middleware

// ✅ SECURITY: Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", process.env.FRONTEND_URL || "http://localhost:3000"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading resources
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
}));

// ✅ SECURITY: Cookie parser for CSRF tokens
app.use(cookieParser());

// Update CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Always normalize the frontend URL (remove trailing slash)
        const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Length', 'X-CSRF-Token']
}));

// ✅ SECURITY: Request size limits to prevent DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ SECURITY: XSS protection - sanitize all inputs
app.use(sanitizeInput);

// ✅ SECURITY: Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Update static file serving with proper headers (around line 28)
app.use('/uploads', (req, res, next) => {
    // Set CORS headers for static files
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
}, express.static(path.join(__dirname, 'uploads')));

// ✅ SECURITY: CSRF token endpoint (call before making state-changing requests)
app.get('/api/csrf-token', getCsrfToken);

// API Routes
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/mechanical-seal-attributes', mechanicalSealRoutes);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: `Route ${req.originalUrl} not found`
    });
});

// Centralized error handler middleware (keep only this one)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'uploads')}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔒 Security features enabled:`);
    console.log(`   ✅ Rate Limiting`);
    console.log(`   ✅ RBAC (Role-Based Access Control)`);
    console.log(`   ✅ CSRF Protection`);
    console.log(`   ✅ XSS Sanitization`);
    console.log(`   ✅ Security Headers (Helmet)`);
    console.log(`   ✅ Input Validation`);
});
