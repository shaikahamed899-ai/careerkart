const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

// Authenticate with JWT
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      const message = info?.message || 'Authentication required';
      return next(new AppError(message, 401, 'UNAUTHORIZED'));
    }
    
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED'));
    }
    
    if (user.isBanned) {
      return next(new AppError('Account is banned', 403, 'ACCOUNT_BANNED'));
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user && user.isActive && !user.isBanned) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403, 'FORBIDDEN'));
    }
    
    next();
  };
};

// Check if user is employer
const isEmployer = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }
  
  if (req.user.role !== 'employer' && req.user.role !== 'admin') {
    return next(new AppError('Employer access required', 403, 'FORBIDDEN'));
  }
  
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }
  
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403, 'FORBIDDEN'));
  }
  
  next();
};

// Check if user has completed onboarding
const requireOnboarding = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }
  
  if (!req.user.isOnboarded) {
    return next(new AppError('Please complete onboarding first', 403, 'ONBOARDING_REQUIRED'));
  }
  
  next();
};

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
  
  const refreshToken = jwt.sign(
    { id: user._id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

// Verify refresh token
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      (t) => t.token === token && new Date(t.expiresAt) > new Date()
    );
    
    if (!tokenExists) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    
    return user;
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    throw error;
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isEmployer,
  isAdmin,
  requireOnboarding,
  generateTokens,
  verifyRefreshToken,
};
