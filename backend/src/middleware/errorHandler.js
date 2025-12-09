const config = require('../config');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      code,
      message,
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    code = 'DUPLICATE_ERROR';
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    code = 'FILE_TOO_LARGE';
    message = 'File size exceeds the limit';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    code = 'UNEXPECTED_FILE';
    message = 'Unexpected file field';
  }

  // Log error in development
  if (config.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      code,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
