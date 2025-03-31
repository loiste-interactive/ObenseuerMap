const express = require('express');
const router = express.Router();
const db = require('../database');
const { generateToken, sendResponse, sendForbidden } = require('../utils');
const { verifyAuth } = require('../middleware/auth');

/**
 * Login route
 * POST /login
 */
router.post('/locations/login', async (req, res) => {
  try {
    const { user, pw } = req.body;
    
    if (!user || !pw) {
      return sendForbidden(res);
    }
    
    // Query database for user
    const users = await db.query(
      'SELECT id FROM users WHERE user = ? AND pw = ?',
      [user, pw]
    );
    
    if (users.length !== 1) {
      return sendForbidden(res);
    }
    
    // Generate token
    const token = generateToken(users[0].id);
    
    // Send response
    sendResponse(res, { token });
  } catch (error) {
    console.error('Login error:', error);
    sendForbidden(res);
  }
});

/**
 * Check token route
 * GET /checktoken
 */
router.get('/locations/checktoken', verifyAuth, (req, res) => {
  sendResponse(res, { result: 'ok' });
});

module.exports = router;