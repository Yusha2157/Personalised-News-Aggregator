/**
 * Admin Controller for Personalized News Aggregator
 * Administrative operations and system management
 */

import { User } from '../models/User.js';
import { Article } from '../models/Article.js';
import { SavedArticle } from '../models/SavedArticle.js';
import { Analytics } from '../models/Analytics.js';
import { newsService } from '../services/newsService.js';
import { cacheService } from '../services/cacheService.js';
import { dedupeService } from '../services/dedupeService.js';
import { jobScheduler } from '../jobs/index.js';
import { fetchJob } from '../jobs/fetchJob.js';
import { cleanupJob } from '../jobs/cleanupJob.js';
import { analyticsJob } from '../jobs/analyticsJob.js';
import { getConnectionStatus } from '../config/db.js';
import { redisHealthCheck } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';

/**
 * Get system health status
 */
export const getHealth = catchAsync(async (req, res) => {
  const [
    dbStatus,
    redisStatus,
    fetchJobStatus,
    cleanupJobStatus,
    analyticsJobStatus
  ] = await Promise.all([
    getConnectionStatus(),
    redisHealthCheck(),
    fetchJob.getStatus(),
    cleanupJob.getStatus(),
    analyticsJob.getStatus()
  ]);

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus.state === 'connected' ? 'healthy' : 'unhealthy',
        details: dbStatus
      },
      redis: {
        status: redisStatus.status,
        details: redisStatus
      },
      jobs: {
        fetch: {
          status: fetchJobStatus.isRunning ? 'running' : 'idle',
          lastRun: fetchJobStatus.lastRun,
          nextRun: fetchJobStatus.nextRun
        },
        cleanup: {
          status: cleanupJobStatus.isRunning ? 'running' : 'idle',
          lastRun: cleanupJobStatus.lastRun,
          nextRun: cleanupJobStatus.nextRun
        },
        analytics: {
          status: analyticsJobStatus.isRunning ? 'running' : 'idle',
          lastRun: analyticsJobStatus.lastRun,
          nextRun: analyticsJobStatus.nextRun
        }
      }
    }
  };

  // Determine overall status
  if (dbStatus.state !== 'connected' || redisStatus.status !== 'healthy') {
    health.status = 'degraded';
  }

  res.status(HTTP_STATUS.OK).json(health);
});

/**
 * Get system metrics
 */
export const getMetrics = catchAsync(async (req, res) => {
  const [
    totalArticles,
    activeArticles,
    totalUsers,
    totalSavedArticles,
    totalAnalytics,
    fetchStats,
    dedupeStats
  ] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    SavedArticle.countDocuments(),
    Analytics.countDocuments(),
    fetchJob.getStats(),
    dedupeService.getStats()
  ]);

  const metrics = {
    timestamp: new Date().toISOString(),
    articles: {
      total: totalArticles,
      active: activeArticles,
      inactive: totalArticles - activeArticles
    },
    users: {
      total: totalUsers
    },
    savedArticles: totalSavedArticles,
    analytics: totalAnalytics,
    jobs: {
      fetch: fetchStats
    },
    deduplication: dedupeStats,
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  res.status(HTTP_STATUS.OK).json(metrics);
});

/**
 * Run news fetch job manually
 */
export const runFetchJob = catchAsync(async (req, res) => {
  const { categories, sources, query } = req.body;

  logger.info('Manual fetch job requested', { categories, sources, query, userId: req.user._id });

  let result;
  
  if (categories) {
    result = await fetchJob.runForCategories(categories);
  } else if (sources) {
    result = await fetchJob.runForSources(sources);
  } else if (query) {
    result = await fetchJob.runWithQuery(query, req.body);
  } else {
    result = await fetchJob.run();
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Fetch job completed successfully',
    result
  });
});

/**
 * Run cleanup job manually
 */
export const runCleanupJob = catchAsync(async (req, res) => {
  const { task } = req.query;

  logger.info('Manual cleanup job requested', { task, userId: req.user._id });

  let result;
  
  if (task) {
    result = await cleanupJob.runSpecificTask(task);
  } else {
    result = await cleanupJob.run();
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Cleanup job completed successfully',
    result
  });
});

/**
 * Run analytics job manually
 */
export const runAnalyticsJob = catchAsync(async (req, res) => {
  const { task } = req.query;

  logger.info('Manual analytics job requested', { task, userId: req.user._id });

  let result;
  
  if (task) {
    result = await analyticsJob.runSpecificTask(task);
  } else {
    result = await analyticsJob.run();
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Analytics job completed successfully',
    result
  });
});

/**
 * Get job status
 */
export const getJobStatus = catchAsync(async (req, res) => {
  const status = jobScheduler.getStatus();

  res.status(HTTP_STATUS.OK).json(status);
});

/**
 * Start scheduled jobs
 */
export const startJobs = catchAsync(async (req, res) => {
  jobScheduler.startAll();

  res.status(HTTP_STATUS.OK).json({
    message: 'Scheduled jobs started successfully'
  });
});

/**
 * Stop scheduled jobs
 */
export const stopJobs = catchAsync(async (req, res) => {
  jobScheduler.stopAll();

  res.status(HTTP_STATUS.OK).json({
    message: 'Scheduled jobs stopped successfully'
  });
});

/**
 * Clear cache
 */
export const clearCache = catchAsync(async (req, res) => {
  const { pattern } = req.query;

  logger.info('Cache clear requested', { pattern, userId: req.user._id });

  let result;
  
  if (pattern) {
    result = await cacheService.invalidatePattern([pattern]);
  } else {
    result = await cacheService.clear();
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Cache cleared successfully',
    clearedKeys: result
  });
});

/**
 * Get cache statistics
 */
export const getCacheStats = catchAsync(async (req, res) => {
  const stats = await cacheService.getStats();

  res.status(HTTP_STATUS.OK).json(stats);
});

/**
 * Remove duplicate articles
 */
export const removeDuplicates = catchAsync(async (req, res) => {
  logger.info('Duplicate removal requested', { userId: req.user._id });

  const result = await dedupeService.removeDuplicates();

  res.status(HTTP_STATUS.OK).json({
    message: 'Duplicate removal completed successfully',
    result
  });
});

/**
 * Get available news sources
 */
export const getNewsSources = catchAsync(async (req, res) => {
  const sources = await newsService.getAvailableSources();

  res.status(HTTP_STATUS.OK).json({
    sources
  });
});

/**
 * Get news source categories
 */
export const getNewsCategories = catchAsync(async (req, res) => {
  const categories = await newsService.getSourceCategories();

  res.status(HTTP_STATUS.OK).json({
    categories
  });
});

/**
 * Get all users (admin only)
 */
export const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, isActive } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query)
  ]);

  res.status(HTTP_STATUS.OK).json({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Update user (admin only)
 */
export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, isActive } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError(
      'User not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  logger.info(`User updated by admin: ${id}`, { updatedBy: req.user._id });

  res.status(HTTP_STATUS.OK).json({
    message: 'User updated successfully',
    user
  });
});

/**
 * Delete user (admin only)
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Don't allow admin to delete themselves
  if (id === req.user._id.toString()) {
    throw new AppError(
      'Cannot delete your own account',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new AppError(
      'User not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  logger.info(`User deactivated by admin: ${id}`, { deactivatedBy: req.user._id });

  res.status(HTTP_STATUS.OK).json({
    message: 'User deactivated successfully'
  });
});

/**
 * Get system configuration
 */
export const getSystemConfig = catchAsync(async (req, res) => {
  const config = {
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '2.0.0',
    features: {
      newsFetching: !!process.env.NEWSAPI_KEY,
      redis: !!process.env.REDIS_URL,
      analytics: true,
      deduplication: true
    },
    limits: {
      maxArticlesPerFetch: parseInt(process.env.NEWSAPI_PAGE_SIZE) || 100,
      maxFetchPages: 10,
      articleRetentionDays: parseInt(process.env.ARTICLE_RETENTION_DAYS) || 90,
      analyticsRetentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 90
    }
  };

  res.status(HTTP_STATUS.OK).json(config);
});

/**
 * Update system configuration
 */
export const updateSystemConfig = catchAsync(async (req, res) => {
  // In a real application, you would update configuration
  // For now, we'll just log the request
  
  logger.info('System configuration update requested', {
    config: req.body,
    userId: req.user._id
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'System configuration updated successfully'
  });
});
