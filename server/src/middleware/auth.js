/**
 * Authentication middleware for Personalized News Aggregator
 * JWT-based authentication with role-based access control
 */

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ERROR_CODES, USER_ROLES } from '../config/constants.js';
import { logger } from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Access token required',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Account is deactivated',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Invalid token',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Token expired',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    return res.status(500).json({
      error: {
        message: 'Authentication failed',
        code: ERROR_CODES.INTERNAL_ERROR
      }
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    } else {
      req.user = null;
      req.userId = null;
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Authentication required',
        code: ERROR_CODES.AUTHENTICATION_ERROR
      }
    });
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({
      error: {
        message: 'Admin access required',
        code: ERROR_CODES.AUTHORIZATION_ERROR
      }
    });
  }

  next();
};

/**
 * Require specific role
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          code: ERROR_CODES.AUTHORIZATION_ERROR
        }
      });
    }

    next();
  };
};

/**
 * Check if user owns resource or is admin
 */
export const requireOwnershipOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }

    const resourceUserId = req.params[userIdParam];
    
    if (req.user.role === USER_ROLES.ADMIN || req.user._id.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: {
        message: 'Access denied',
        code: ERROR_CODES.AUTHORIZATION_ERROR
      }
    });
  };
};

/**
 * Generate JWT token
 */
export const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'news-aggregator',
    audience: 'news-aggregator-users'
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    type: 'refresh'
  };

  const options = {
    expiresIn: '7d',
    issuer: 'news-aggregator',
    audience: 'news-aggregator-users'
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Legacy function for backward compatibility
export function requireAuth(req, res, next) {
  return authenticateToken(req, res, next);
}


