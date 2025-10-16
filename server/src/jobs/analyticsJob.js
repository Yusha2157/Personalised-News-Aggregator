/**
 * Analytics Job for Personalized News Aggregator
 * Scheduled job for updating analytics and trending data
 */

import { analyticsService } from '../services/analyticsService.js';
import { cacheService } from '../services/cacheService.js';
import { logger } from '../config/logger.js';

class AnalyticsJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.lastResult = null;
  }

  /**
   * Run the analytics update job
   */
  async run() {
    if (this.isRunning) {
      logger.warn('Analytics job is already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();

    try {
      logger.info('Starting analytics update job...');

      const results = {
        trendingData: null,
        systemAnalytics: null,
        cacheInvalidated: false,
        totalDuration: 0
      };

      const startTime = Date.now();

      // Update trending data
      results.trendingData = await this.updateTrendingData();
      
      // Update system analytics
      results.systemAnalytics = await this.updateSystemAnalytics();
      
      // Invalidate relevant caches
      results.cacheInvalidated = await this.invalidateCaches();

      results.totalDuration = Date.now() - startTime;
      this.lastResult = results;

      logger.info('Analytics job completed', {
        trendingCategories: results.trendingData?.categories?.length || 0,
        trendingTags: results.trendingData?.tags?.length || 0,
        duration: results.totalDuration
      });

      // Store analytics job results
      await this.storeJobAnalytics(results);

      return results;
    } catch (error) {
      logger.error('Analytics job failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Update trending data
   */
  async updateTrendingData() {
    try {
      logger.info('Updating trending data...');

      // Update trending data for different periods
      const periods = [1, 7, 30]; // 1 day, 1 week, 1 month
      const trendingData = {};

      for (const period of periods) {
        trendingData[`${period}d`] = await analyticsService.getTrendingData(period, {
          limit: 20
        });
      }

      // Store trending data
      await analyticsService.storeTrendingData(new Date(), trendingData);

      logger.info('Trending data updated successfully');
      return trendingData;
    } catch (error) {
      logger.error('Error updating trending data:', error);
      return null;
    }
  }

  /**
   * Update system analytics
   */
  async updateSystemAnalytics() {
    try {
      logger.info('Updating system analytics...');

      // Get system-wide analytics
      const systemAnalytics = await analyticsService.getSystemAnalytics(30);

      // Store system analytics
      await analyticsService.storeAnalyticsData('system_metrics', systemAnalytics);

      logger.info('System analytics updated successfully');
      return systemAnalytics;
    } catch (error) {
      logger.error('Error updating system analytics:', error);
      return null;
    }
  }

  /**
   * Invalidate relevant caches
   */
  async invalidateCaches() {
    try {
      logger.info('Invalidating analytics caches...');

      const patterns = [
        'trending:*',
        'analytics:*',
        'system:*'
      ];

      const invalidatedCount = await cacheService.invalidatePattern(patterns);

      logger.info(`Invalidated ${invalidatedCount} cache keys`);
      return invalidatedCount > 0;
    } catch (error) {
      logger.error('Error invalidating caches:', error);
      return false;
    }
  }

  /**
   * Store job analytics
   */
  async storeJobAnalytics(results) {
    try {
      const { Analytics } = await import('../models/Analytics.js');
      
      await Analytics.storeSystemHealth({
        analyticsJobRun: new Date(),
        analyticsResults: results,
        analyticsStatus: 'success'
      });
    } catch (error) {
      logger.error('Failed to store job analytics:', error);
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
   * Get next run time (every 15 minutes)
   */
  getNextRunTime() {
    if (!this.lastRun) return null;
    
    const nextRun = new Date(this.lastRun);
    nextRun.setMinutes(nextRun.getMinutes() + 15);
    
    return nextRun;
  }

  /**
   * Run specific analytics task
   */
  async runSpecificTask(taskName) {
    logger.info(`Running specific analytics task: ${taskName}`);

    switch (taskName) {
      case 'trending':
        return await this.updateTrendingData();
      case 'system':
        return await this.updateSystemAnalytics();
      case 'cache':
        return await this.invalidateCaches();
      default:
        throw new Error(`Unknown analytics task: ${taskName}`);
    }
  }

  /**
   * Get analytics health status
   */
  async getHealthStatus() {
    try {
      return await analyticsService.getHealthStatus();
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
   * Generate analytics report
   */
  async generateReport(period = 7) {
    try {
      logger.info(`Generating analytics report for ${period} days...`);

      const [
        trendingData,
        systemAnalytics,
        userActivity,
        articlePerformance
      ] = await Promise.all([
        analyticsService.getTrendingData(period),
        analyticsService.getSystemAnalytics(period),
        analyticsService.getUserActivityMetrics(period),
        analyticsService.getArticlePerformanceMetrics(period)
      ]);

      const report = {
        period,
        generatedAt: new Date().toISOString(),
        trending: trendingData,
        system: systemAnalytics,
        userActivity,
        articlePerformance,
        summary: {
          totalSaves: trendingData?.summary?.totalSaves || 0,
          uniqueUsers: userActivity?.uniqueUsers || 0,
          totalArticles: systemAnalytics?.overview?.totalArticles || 0,
          totalUsers: systemAnalytics?.overview?.totalUsers || 0
        }
      };

      logger.info('Analytics report generated successfully');
      return report;
    } catch (error) {
      logger.error('Error generating analytics report:', error);
      throw error;
    }
  }

  /**
   * Test analytics job (dry run)
   */
  async testRun() {
    logger.info('Running test analytics job...');

    try {
      // Run analytics update
      const results = await this.run();
      
      // Generate a test report
      const report = await this.generateReport(1);

      logger.info('Test analytics job completed', {
        results,
        reportGenerated: !!report
      });

      return {
        results,
        report
      };
    } catch (error) {
      logger.error('Test analytics job failed:', error);
      throw error;
    }
  }

  /**
   * Get analytics statistics
   */
  async getStats() {
    try {
      const { Analytics } = await import('../models/Analytics.js');
      
      // Get recent analytics job runs
      const recentRuns = await Analytics.find({
        type: 'system_health',
        'data.analyticsJobRun': { $exists: true }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const totalRuns = recentRuns.length;
      const successfulRuns = recentRuns.filter(run => 
        run.data.analyticsStatus === 'success'
      ).length;

      return {
        totalRuns,
        successfulRuns,
        successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
        lastRun: this.lastRun,
        isRunning: this.isRunning,
        lastResult: this.lastResult
      };
    } catch (error) {
      logger.error('Error getting analytics stats:', error);
      return null;
    }
  }

  /**
   * Force cache refresh
   */
  async forceCacheRefresh() {
    try {
      logger.info('Force refreshing analytics caches...');

      const patterns = [
        'trending:*',
        'analytics:*',
        'system:*',
        'articles:trending:*'
      ];

      const invalidatedCount = await cacheService.invalidatePattern(patterns);

      logger.info(`Force refreshed ${invalidatedCount} cache keys`);
      return invalidatedCount;
    } catch (error) {
      logger.error('Error force refreshing caches:', error);
      return 0;
    }
  }
}

export const analyticsJob = new AnalyticsJob();
