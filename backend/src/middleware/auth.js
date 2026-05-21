const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key_64_chars_hex';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access Denied: Missing Authorization Bearer Token'
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user claims to request
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: Invalid or expired access token'
    });
  }
};

module.exports = { authenticateToken };
