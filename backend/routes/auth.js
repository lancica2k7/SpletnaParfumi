const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { 
  loginLimiter, 
  registerLimiter, 
  checkBruteForce, 
  validateRegister, 
  validateLogin 
} = require('../middleware/security');

const router = express.Router();

// Register new user
router.post('/register', registerLimiter, validateRegister, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, phone || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Store session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await pool.execute(
      `INSERT INTO user_sessions (user_id, token, expires_at) 
       VALUES (?, ?, ?)`,
      [result.insertId, token, expiresAt]
    );

    // Log successful registration
    await pool.execute(
      `INSERT INTO login_attempts (email, ip_address, success) 
       VALUES (?, ?, TRUE)`,
      [email, ipAddress]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// Login user
router.post('/login', loginLimiter, checkBruteForce, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Log failed attempt
      await pool.execute(
        `INSERT INTO login_attempts (email, ip_address, success) 
         VALUES (?, ?, FALSE)`,
        [email, ipAddress]
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Log failed attempt
      await pool.execute(
        `INSERT INTO login_attempts (email, ip_address, success) 
         VALUES (?, ?, FALSE)`,
        [email, ipAddress]
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Store session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await pool.execute(
      `INSERT INTO user_sessions (user_id, token, expires_at) 
       VALUES (?, ?, ?)`,
      [user.id, token, expiresAt]
    );

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Log successful login
    await pool.execute(
      `INSERT INTO login_attempts (email, ip_address, success) 
       VALUES (?, ?, TRUE)`,
      [email, ipAddress]
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, phone, role, created_at, last_login FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout (invalidate token)
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Delete session from database
      await pool.execute(
        'DELETE FROM user_sessions WHERE token = ?',
        [token]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router;

