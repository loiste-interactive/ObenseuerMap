const { verifyToken, sendForbidden } = require('../utils');
const db = require('../database');

/**
 * Middleware to verify JWT token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
async function verifyAuth(req, res, next) {
  // Get token from header
  const token = req.headers['x-token'];
  
  if (!token) {
    return sendForbidden(res);
  }
  
  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return sendForbidden(res);
  }
  
  try {
    // Verify user exists in database
    const users = await db.query(
      'SELECT id, pw FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length !== 1) {
      return sendForbidden(res);
    }
    
    // Store user in request object
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendForbidden(res);
  }
}

module.exports = {
  verifyAuth
};