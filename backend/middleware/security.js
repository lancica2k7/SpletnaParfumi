const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Check for brute force attempts
const checkBruteForce = async (req, res, next) => {
  try {
    const email = req.body.email;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check failed attempts in last 15 minutes
    const [attempts] = await pool.execute(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE email = ? AND success = FALSE 
       AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
      [email]
    );

    if (attempts[0].count >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed login attempts. Please try again later.'
      });
    }

    next();
  } catch (error) {
    next();
  }
};

// Validation middleware
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  loginLimiter,
  registerLimiter,
  checkBruteForce,
  validateRegister,
  validateLogin
};

