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

  // Allow a static development token in non-production environments OR when using the fallback JWT secret OR when running locally on localhost
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const isDevelopment = process.env.NODE_ENV !== 'production' || JWT_SECRET === 'fallback_development_secret_key_64_chars_hex' || isLocalhost;
  if (isDevelopment && token === 'development-token-glowassist') {
    req.user = { userId: 'dev-admin', role: 'admin', email: 'admin@glowassist.co' };
    return next();
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
