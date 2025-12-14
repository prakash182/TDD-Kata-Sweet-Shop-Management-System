// backend/middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

const authMiddleware = (req, res, next) => {
  // 1. Check for header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // 2. Extract Token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify Token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. Attach payload to request (This makes req.user.userId work!)
    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  // Ensure authMiddleware ran first
  if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };