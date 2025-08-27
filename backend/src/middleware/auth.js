const jwt = require('jsonwebtoken');
const { verifyFirebaseToken } = require('../services/firebase');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token
      try {
        const firebaseUser = await verifyFirebaseToken(token);
        req.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          provider: 'firebase',
        };
        next();
      } catch (firebaseError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token.',
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error.',
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (jwtError) {
        try {
          const firebaseUser = await verifyFirebaseToken(token);
          req.user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            provider: 'firebase',
          };
        } catch (firebaseError) {
          // Token is invalid, but we don't fail the request
          req.user = null;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  authorize,
};