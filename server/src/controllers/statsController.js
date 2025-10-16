/**
 * Statistics Controller for Personalized News Aggregator
 * Analytics and trending data endpoints
 */

import { analyticsService } from '../services/analyticsService.js';
import { cacheService } from '../services/cacheService.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';

/**
 * Get trending data
 */
export const getTrending = catchAsync(async (req, res) => {
  const { period = 7, limit = 10 } = req.query;

  const cacheKey = `trending:${period}:${limit}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const trendingData = await analyticsService.getTrendingData(parseInt(period), {
    limit: parseInt(limit)
  });

  // Cache for 1 minute
  await cacheService.set(cacheKey, trendingData, 60);

  res.status(HTTP_STATUS.OK).json(trendingData);
});

/**
 * Get system analytics
 */
export const getSystemAnalytics = catchAsync(async (req, res) => {
  const { period = 30 } = req.query;

  const cacheKey = `system:analytics:${period}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const analytics = await analyticsService.getSystemAnalytics(parseInt(period));

  // Cache for 1 hour
  await cacheService.set(cacheKey, analytics, 3600);

  res.status(HTTP_STATUS.OK).json(analytics);
});

/**
 * Get trending categories
 */
export const getTrendingCategories = catchAsync(async (req, res) => {
  const { period = 7, limit = 10 } = req.query;

  const cacheKey = `trending:categories:${period}:${limit}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const categories = await analyticsService.getTrendingCategories(
    parseInt(period),
    parseInt(limit)
  );

  const response = {
    categories,
    period: parseInt(period),
    limit: parseInt(limit),
    generatedAt: new Date().toISOString()
  };

  // Cache for 5 minutes
  await cacheService.set(cacheKey, response, 300);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get trending tags
 */
export const getTrendingTags = catchAsync(async (req, res) => {
  const { period = 7, limit = 10 } = req.query;

  const cacheKey = `trending:tags:${period}:${limit}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const tags = await analyticsService.getTrendingTags(
    parseInt(period),
    parseInt(limit)
  );

  const response = {
    tags,
    period: parseInt(period),
    limit: parseInt(limit),
    generatedAt: new Date().toISOString()
  };

  // Cache for 5 minutes
  await cacheService.set(cacheKey, response, 300);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get trending sources
 */
export const getTrendingSources = catchAsync(async (req, res) => {
  const { period = 7, limit = 10 } = req.query;

  const cacheKey = `trending:sources:${period}:${limit}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const sources = await analyticsService.getTrendingSources(
    parseInt(period),
    parseInt(limit)
  );

  const response = {
    sources,
    period: parseInt(period),
    limit: parseInt(limit),
    generatedAt: new Date().toISOString()
  };

  // Cache for 5 minutes
  await cacheService.set(cacheKey, response, 300);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get top saved articles
 */
export const getTopSavedArticles = catchAsync(async (req, res) => {
  const { period = 7, limit = 10 } = req.query;

  const cacheKey = `trending:top-articles:${period}:${limit}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const articles = await analyticsService.getTopSavedArticles(
    parseInt(period),
    parseInt(limit)
  );

  const response = {
    articles,
    period: parseInt(period),
    limit: parseInt(limit),
    generatedAt: new Date().toISOString()
  };

  // Cache for 5 minutes
  await cacheService.set(cacheKey, response, 300);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get user activity metrics
 */
export const getUserActivity = catchAsync(async (req, res) => {
  const { period = 7 } = req.query;

  const cacheKey = `stats:user-activity:${period}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const activity = await analyticsService.getUserActivityMetrics(parseInt(period));

  // Cache for 10 minutes
  await cacheService.set(cacheKey, activity, 600);

  res.status(HTTP_STATUS.OK).json(activity);
});

/**
 * Get analytics health status
 */
export const getAnalyticsHealth = catchAsync(async (req, res) => {
  const health = await analyticsService.getHealthStatus();

  res.status(HTTP_STATUS.OK).json(health);
});

/**
 * Generate analytics report
 */
export const generateReport = catchAsync(async (req, res) => {
  const { period = 7 } = req.query;

  const report = await analyticsService.generateReport(parseInt(period));

  res.status(HTTP_STATUS.OK).json(report);
});
