const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const mechanicalSealRoutes = require('./routes/mechanicalSealRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
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
});
