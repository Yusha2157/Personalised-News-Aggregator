/**
 * Analytics Service for Personalized News Aggregator
 * Comprehensive analytics and trending calculation
 */

import { SavedArticle } from '../models/SavedArticle.js';
import { Article } from '../models/Article.js';
import { User } from '../models/User.js';
import { Analytics } from '../models/Analytics.js';
import { logger } from '../config/logger.js';
import { cacheService } from './cacheService.js';
import { CACHE_TTL } from '../config/constants.js';

class AnalyticsService {
  constructor() {
    this.cacheTimeout = CACHE_TTL.TRENDING_STATS;
  }

  /**
   * Get trending data for a specific period
   * @param {number} period - Period in days
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Trending data
   */
  async getTrendingData(period = 7, options = {}) {
    try {
      const cacheKey = `trending:${period}:${JSON.stringify(options)}`;
      
      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug('Returning cached trending data');
        return cached;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get trending categories
      const trendingCategories = await this.getTrendingCategories(period, options.limit);
      
      // Get trending tags
      const trendingTags = await this.getTrendingTags(period, options.limit);
      
      // Get trending sources
      const trendingSources = await this.getTrendingSources(period, options.limit);
      
      // Get most saved articles
      const topArticles = await this.getTopSavedArticles(period, options.limit);
      
      // Get user activity metrics
      const userActivity = await this.getUserActivityMetrics(period);

      const trendingData = {
        period,
        generatedAt: new Date().toISOString(),
        categories: trendingCategories,
        tags: trendingTags,
        sources: trendingSources,
        topArticles,
        userActivity,
        summary: {
          totalSaves: trendingCategories.reduce((sum, cat) => sum + cat.count, 0),
          uniqueUsers: userActivity.uniqueUsers || 0,
          avgSavesPerUser: userActivity.avgSavesPerUser || 0
        }
      };

      // Cache the result
      await cacheService.set(cacheKey, trendingData, this.cacheTimeout);

      logger.info(`Generated trending data for ${period} days`);
      return trendingData;
    } catch (error) {
      logger.error('Error getting trending data:', error);
      throw error;
    }
  }

  /**
   * Get trending categories
   */
  async getTrendingCategories(period = 7, limit = 10) {
    try {
      const result = await SavedArticle.getTrendingCategories(period, limit);
      return result.map(item => ({
        category: item.category,
        count: item.count,
        uniqueUsers: item.uniqueUsers
      }));
    } catch (error) {
      logger.error('Error getting trending categories:', error);
      return [];
    }
  }

  /**
   * Get trending tags
   */
  async getTrendingTags(period = 7, limit = 10) {
    try {
      const result = await SavedArticle.getTrendingTags(period, limit);
      return result.map(item => ({
        tag: item._id,
        count: item.count
      }));
    } catch (error) {
      logger.error('Error getting trending tags:', error);
      return [];
    }
  }

  /**
   * Get trending sources
   */
  async getTrendingSources(period = 7, limit = 10) {
    try {
      const result = await SavedArticle.getTrendingSources(period, limit);
      return result.map(item => ({
        source: item.source,
        count: item.count,
        uniqueUsers: item.uniqueUsers
      }));
    } catch (error) {
      logger.error('Error getting trending sources:', error);
      return [];
    }
  }

  /**
   * Get top saved articles
   */
  async getTopSavedArticles(period = 7, limit = 10) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - period);

      const pipeline = [
        {
          $match: {
            savedAt: { $gte: date }
          }
        },
        {
          $group: {
            _id: '$articleId',
            saves: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            articleId: '$_id',
            saves: 1,
            uniqueUserCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { saves: -1 }
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'articles',
            localField: 'articleId',
            foreignField: '_id',
            as: 'article'
          }
        },
        {
          $unwind: '$article'
        },
        {
          $project: {
            articleId: 1,
            saves: 1,
            uniqueUserCount: 1,
            title: '$article.title',
            url: '$article.url',
            source: '$article.source.name',
            publishedAt: '$article.publishedAt',
            category: '$article.category'
          }
        }
      ];

      const result = await SavedArticle.aggregate(pipeline);
      return result;
    } catch (error) {
      logger.error('Error getting top saved articles:', error);
      return [];
    }
  }

  /**
   * Get user activity metrics
   */
  async getUserActivityMetrics(period = 7) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - period);

      const pipeline = [
        {
          $match: {
            savedAt: { $gte: date }
          }
        },
        {
          $group: {
            _id: '$userId',
            saves: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalSaves: { $sum: '$saves' },
            uniqueUsers: { $sum: 1 },
            avgSavesPerUser: { $avg: '$saves' }
          }
        }
      ];

      const result = await SavedArticle.aggregate(pipeline);
      return result[0] || { totalSaves: 0, uniqueUsers: 0, avgSavesPerUser: 0 };
    } catch (error) {
      logger.error('Error getting user activity metrics:', error);
      return { totalSaves: 0, uniqueUsers: 0, avgSavesPerUser: 0 };
    }
  }

  /**
   * Get article performance metrics
   */
  async getArticlePerformance(articleId, period = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - period);

      const pipeline = [
        {
          $match: {
            articleId: articleId,
            savedAt: { $gte: date }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$savedAt' },
              month: { $month: '$savedAt' },
              day: { $dayOfMonth: '$savedAt' }
            },
            saves: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            saves: 1,
            uniqueUserCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { date: 1 }
        }
      ];

      return await SavedArticle.aggregate(pipeline);
    } catch (error) {
      logger.error('Error getting article performance:', error);
      return [];
    }
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(userId, period = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - period);

      const pipeline = [
        {
          $match: {
            userId: userId,
            savedAt: { $gte: date }
          }
        },
        {
          $group: {
            _id: '$category',
            saves: { $sum: 1 }
          }
        },
        {
          $sort: { saves: -1 }
        }
      ];

      const categoryStats = await SavedArticle.aggregate(pipeline);

      // Get tag preferences
      const tagPipeline = [
        {
          $match: {
            userId: userId,
            savedAt: { $gte: date }
          }
        },
        {
          $unwind: '$tags'
        },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ];

      const tagStats = await SavedArticle.aggregate(tagPipeline);

      return {
        categories: categoryStats,
        tags: tagStats,
        period,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting user engagement:', error);
      return { categories: [], tags: [], period, generatedAt: new Date().toISOString() };
    }
  }

  /**
   * Get system-wide analytics
   */
  async getSystemAnalytics(period = 30) {
    try {
      const cacheKey = `system:analytics:${period}`;
      
      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const date = new Date();
      date.setDate(date.getDate() - period);

      // Get various metrics
      const [
        totalArticles,
        totalUsers,
        totalSaves,
        articlesByCategory,
        articlesBySource,
        userActivity
      ] = await Promise.all([
        Article.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: true }),
        SavedArticle.countDocuments({ savedAt: { $gte: date } }),
        this.getArticlesByCategory(),
        this.getArticlesBySource(),
        this.getUserActivityMetrics(period)
      ]);

      const analytics = {
        period,
        generatedAt: new Date().toISOString(),
        overview: {
          totalArticles,
          totalUsers,
          totalSaves,
          avgSavesPerUser: userActivity.avgSavesPerUser || 0
        },
        distribution: {
          articlesByCategory,
          articlesBySource
        },
        activity: userActivity
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, analytics, 3600);

      return analytics;
    } catch (error) {
      logger.error('Error getting system analytics:', error);
      throw error;
    }
  }

  /**
   * Get articles by category distribution
   */
  async getArticlesByCategory() {
    try {
      const pipeline = [
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ];

      return await Article.aggregate(pipeline);
    } catch (error) {
      logger.error('Error getting articles by category:', error);
      return [];
    }
  }

  /**
   * Get articles by source distribution
   */
  async getArticlesBySource() {
    try {
      const pipeline = [
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: '$source.name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 20
        }
      ];

      return await Article.aggregate(pipeline);
    } catch (error) {
      logger.error('Error getting articles by source:', error);
      return [];
    }
  }

  /**
   * Store analytics data
   */
  async storeAnalyticsData(type, data, period = 'daily') {
    try {
      return await Analytics.storeDailyMetrics(new Date(), {
        type,
        data,
        period
      });
    } catch (error) {
      logger.error('Error storing analytics data:', error);
      throw error;
    }
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldAnalytics(retentionDays = 90) {
    try {
      const result = await Analytics.cleanupOldData(retentionDays);
      logger.info(`Cleaned up ${result.deletedCount} old analytics records`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up old analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics health status
   */
  async getHealthStatus() {
    try {
      const checks = await Promise.all([
        this.testDatabaseConnection(),
        this.testCacheConnection(),
        this.testDataIntegrity()
      ]);

      const allHealthy = checks.every(check => check.status === 'healthy');

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting analytics health status:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    try {
      await Article.findOne().limit(1);
      return { status: 'healthy', message: 'Database connection OK' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Test cache connection
   */
  async testCacheConnection() {
    try {
      const health = await cacheService.healthCheck();
      return { status: health.status, message: health.response || health.error };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Test data integrity
   */
  async testDataIntegrity() {
    try {
      const articleCount = await Article.countDocuments();
      const userCount = await User.countDocuments();
      
      if (articleCount === 0 && userCount === 0) {
        return { status: 'warning', message: 'No data found in database' };
      }

      return { status: 'healthy', message: `Found ${articleCount} articles and ${userCount} users` };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

export const analyticsService = new AnalyticsService();
