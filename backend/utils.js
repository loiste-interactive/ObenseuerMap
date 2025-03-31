const jwt = require('jsonwebtoken');
const config = require('./config');

/**
 * Generate a JWT token
 * @param {number} userId - The user ID to include in the token
 * @returns {string} - The generated JWT token
 */
function generateToken(userId) {
  const payload = {
    id: userId
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    algorithm: 'HS256'
  });
}

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Send a JSON response
 * @param {object} res - Express response object
 * @param {any} data - Data to send
 * @param {number} statusCode - HTTP status code
 */
function sendResponse(res, data, statusCode = 200) {
  res.status(statusCode).json(data);
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
function sendError(res, message = 'An error occurred', statusCode = 500) {
  res.status(statusCode).json({ error: message });
}

/**
 * Send a forbidden response
 * @param {object} res - Express response object
 */
function sendForbidden(res) {
  res.status(403).json({ error: 'gtfo' });
}

module.exports = {
  generateToken,
  verifyToken,
  sendResponse,
  sendError,
  sendForbidden
};