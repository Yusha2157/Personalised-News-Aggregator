/**
 * Request logging middleware
 * Logs HTTP requests with timing and context information
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  // Generate or use existing request ID
  req.requestId = req.headers['x-request-id'] || uuidv4();
  
  // Set request ID in response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  // Create child logger with request context
  req.logger = logger.child({
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  // Log request start
  const startTime = Date.now();
  req.startTime = startTime;

  req.logger.info('Request started', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log response
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(body).length,
      user: req.user ? req.user._id : null
    });

    // Performance warnings
    if (duration > 5000) {
      req.logger.warn('Slow request detected', {
        duration: `${duration}ms`,
        method: req.method,
        url: req.originalUrl
      });
    }

    // Error logging
    if (res.statusCode >= 400) {
      req.logger.error('Request error', {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        method: req.method,
        url: req.originalUrl,
        error: body
      });
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Security logging middleware
 */
export const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /onload=/i, // Event handler injection
  ];

  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || '';
  const body = JSON.stringify(req.body || {});

  // Check for suspicious patterns
  const suspiciousActivity = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent) || pattern.test(body)
  );

  if (suspiciousActivity) {
    req.logger?.warn('Suspicious activity detected', {
      url,
      userAgent,
      ip: req.ip,
      body: req.body,
      headers: req.headers
    });
  }

  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err, req, res, next) => {
  if (req.logger) {
    req.logger.error('Request error occurred', {
      error: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      query: req.query,
      user: req.user ? req.user._id : null
    });
  }

  next(err);
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    req.logger?.info('Performance metrics', {
      duration: `${duration.toFixed(2)}ms`,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    });

    // Alert on high memory usage
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
      req.logger?.warn('High memory usage detected', {
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        method: req.method,
        url: req.originalUrl
      });
    }
  });

  next();
};

/**
 * API usage tracking middleware
 */
export const apiUsageTracker = (req, res, next) => {
  // Track API usage for analytics
  const apiKey = `${req.method}:${req.route?.path || req.originalUrl}`;
  
  res.on('finish', () => {
    req.logger?.info('API usage tracked', {
      endpoint: apiKey,
      statusCode: res.statusCode,
      user: req.user ? req.user._id : null,
      timestamp: new Date().toISOString()
    });
  });

  next();
};
