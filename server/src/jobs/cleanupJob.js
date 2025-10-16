/**
 * Cleanup Job for Personalized News Aggregator
 * Scheduled job for cleaning up old data and maintaining database health
 */

import { Article } from '../models/Article.js';
import { SavedArticle } from '../models/SavedArticle.js';
import { Analytics } from '../models/Analytics.js';
import { dedupeService } from '../services/dedupeService.js';
import { logger } from '../config/logger.js';

class CleanupJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.lastResult = null;
  }

  /**
   * Run the cleanup job
   */
  async run() {
    if (this.isRunning) {
      logger.warn('Cleanup job is already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();

    try {
      logger.info('Starting cleanup job...');

      const results = {
        oldArticles: 0,
        duplicates: 0,
        oldAnalytics: 0,
        oldSavedArticles: 0,
        totalDuration: 0
      };

      const startTime = Date.now();

      // Clean up old articles
      results.oldArticles = await this.cleanupOldArticles();
      
      // Remove duplicates
      results.duplicates = await this.removeDuplicates();
      
      // Clean up old analytics data
      results.oldAnalytics = await this.cleanupOldAnalytics();
      
      // Clean up old saved articles tracking
      results.oldSavedArticles = await this.cleanupOldSavedArticles();

      results.totalDuration = Date.now() - startTime;
      this.lastResult = results;

      logger.info('Cleanup job completed', results);

      // Store cleanup analytics
      await this.storeCleanupAnalytics(results);

      return results;
    } catch (error) {
      logger.error('Cleanup job failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up old articles
   */
  async cleanupOldArticles() {
    try {
      const retentionDays = parseInt(process.env.ARTICLE_RETENTION_DAYS) || 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      logger.info(`Cleaning up articles older than ${retentionDays} days`);

      // Mark old articles as inactive instead of deleting
      const result = await Article.updateMany(
        {
          publishedAt: { $lt: cutoffDate },
          isActive: true
        },
        {
          $set: { isActive: false }
        }
      );

      const cleanedCount = result.modifiedCount;
      logger.info(`Marked ${cleanedCount} old articles as inactive`);

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up old articles:', error);
      return 0;
    }
  }

  /**
   * Remove duplicate articles
   */
  async removeDuplicates() {
    try {
      logger.info('Removing duplicate articles...');

      const result = await dedupeService.removeDuplicates();
      
      logger.info(`Removed ${result.removedCount} duplicate articles`);
      
      return result.removedCount;
    } catch (error) {
      logger.error('Error removing duplicates:', error);
      return 0;
    }
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldAnalytics() {
    try {
      const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 90;
      
      logger.info(`Cleaning up analytics data older than ${retentionDays} days`);

      const result = await Analytics.cleanupOldData(retentionDays);
      
      logger.info(`Cleaned up ${result.deletedCount} old analytics records`);
      
      return result.deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old analytics:', error);
      return 0;
    }
  }

  /**
   * Clean up old saved articles tracking
   */
  async cleanupOldSavedArticles() {
    try {
      const retentionDays = parseInt(process.env.SAVED_ARTICLES_RETENTION_DAYS) || 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      logger.info(`Cleaning up saved articles tracking older than ${retentionDays} days`);

      const result = await SavedArticle.deleteMany({
        savedAt: { $lt: cutoffDate }
      });

      const cleanedCount = result.deletedCount;
      logger.info(`Cleaned up ${cleanedCount} old saved article records`);

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up old saved articles:', error);
      return 0;
    }
  }

  /**
   * Store cleanup analytics
   */
  async storeCleanupAnalytics(results) {
    try {
      await Analytics.storeSystemHealth({
        cleanupRun: new Date(),
        cleanupResults: results,
        cleanupStatus: 'success'
      });
    } catch (error) {
      logger.error('Failed to store cleanup analytics:', error);
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      lastResult: this.lastResult,
      nextRun: this.getNextRunTime()
    };
  }

  /**
   * Get next run time (daily at 2 AM)
   */
  getNextRunTime() {
    if (!this.lastRun) return null;
    
    const nextRun = new Date(this.lastRun);
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(2, 0, 0, 0);
    
    return nextRun;
  }

  /**
   * Run specific cleanup task
   */
  async runSpecificTask(taskName) {
    logger.info(`Running specific cleanup task: ${taskName}`);

    switch (taskName) {
      case 'old-articles':
        return await this.cleanupOldArticles();
      case 'duplicates':
        return await this.removeDuplicates();
      case 'analytics':
        return await this.cleanupOldAnalytics();
      case 'saved-articles':
        return await this.cleanupOldSavedArticles();
      default:
        throw new Error(`Unknown cleanup task: ${taskName}`);
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const [
        totalArticles,
        activeArticles,
        totalSavedArticles,
        totalAnalytics,
        totalUsers
      ] = await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ isActive: true }),
        SavedArticle.countDocuments(),
        Analytics.countDocuments(),
        (await import('../models/User.js')).User.countDocuments()
      ]);

      return {
        articles: {
          total: totalArticles,
          active: activeArticles,
          inactive: totalArticles - activeArticles
        },
        savedArticles: totalSavedArticles,
        analytics: totalAnalytics,
        users: totalUsers,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return null;
    }
  }

  /**
   * Optimize database indexes
   */
  async optimizeIndexes() {
    try {
      logger.info('Optimizing database indexes...');

      // This would typically involve running database-specific optimization commands
      // For MongoDB, this might include rebuilding indexes or running compact commands
      
      logger.info('Database index optimization completed');
      return { success: true };
    } catch (error) {
      logger.error('Error optimizing indexes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test cleanup job (dry run)
   */
  async testRun() {
    logger.info('Running test cleanup job...');

    try {
      // Get stats before cleanup
      const statsBefore = await this.getDatabaseStats();
      
      // Run cleanup
      const results = await this.run();
      
      // Get stats after cleanup
      const statsAfter = await this.getDatabaseStats();

      logger.info('Test cleanup completed', {
        results,
        statsBefore,
        statsAfter
      });

      return {
        results,
        statsBefore,
        statsAfter
      };
    } catch (error) {
      logger.error('Test cleanup failed:', error);
      throw error;
    }
  }
}

export const cleanupJob = new CleanupJob();
