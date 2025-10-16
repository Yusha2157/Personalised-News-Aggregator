/**
 * Global error handling middleware
 * Centralized error processing and logging
 */

import { logger } from '../config/logger.js';
import { ERROR_CODES, HTTP_STATUS } from '../config/constants.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || ERROR_CODES.INTERNAL_ERROR;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));

  return new AppError(
    'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ERROR_CODES.VALIDATION_ERROR,
    errors
  );
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return new AppError(
    `${field} '${value}' already exists`,
    HTTP_STATUS.CONFLICT,
    ERROR_CODES.DUPLICATE_ERROR
  );
};

/**
 * Handle Mongoose cast errors
 */
const handleCastError = (error) => {
  return new AppError(
    `Invalid ${error.path}: ${error.value}`,
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.VALIDATION_ERROR
  );
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError(
    'Invalid token. Please log in again.',
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTHENTICATION_ERROR
  );
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new AppError(
    'Token expired. Please log in again.',
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTHENTICATION_ERROR
  );
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: {
      message: err.message,
      code: err.code,
      details: err.details,
      stack: err.stack
    }
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details && { details: err.details })
      }
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Something went wrong!',
        code: ERROR_CODES.INTERNAL_ERROR
      }
    });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.code = err.code || ERROR_CODES.INTERNAL_ERROR;

  // Log error with request context
  logger.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Handle async errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Not found - ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND
  );
  next(error);
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection at:', promise, 'reason:', err);
    
    // Close server gracefully
    process.exit(1);
  });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    
    // Close server gracefully
    process.exit(1);
  });
};
