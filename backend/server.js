const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting & slowdown (protect against DDoS/brute force)
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again in a few minutes.'
  }
});

const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 40,
  delayMs: () => 300
});

// Apply before body parsing so rate limits fire fast
app.use(speedLimiter);
app.use(generalLimiter);

// Stripe webhook needs raw body - mount BEFORE JSON parsing
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

