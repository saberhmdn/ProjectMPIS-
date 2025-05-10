const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Test route to verify token
router.get('/verify', authMiddleware, (req, res) => {
  try {
    // If middleware passes, token is valid
    res.json({
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route (for testing)
router.post('/login', (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // For testing: accept any credentials
    const token = jwt.sign(
      { userId: 'test-' + Date.now(), role: role || 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: 'test-' + Date.now(),
        email,
        role: role || 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  try {
    // User data is attached to req by the auth middleware
    res.json({
      user: {
        id: req.user.userId,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
