/**
 * News Fetching Job for Personalized News Aggregator
 * Scheduled job for fetching news articles from external APIs
 */

import { newsService } from '../services/newsService.js';
import { analyticsService } from '../services/analyticsService.js';
import { logger } from '../config/logger.js';
import { NEWS_CATEGORIES } from '../config/constants.js';

class FetchJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.lastResult = null;
  }

  /**
   * Run the news fetching job
   */
  async run() {
    if (this.isRunning) {
      logger.warn('Fetch job is already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();

    try {
      logger.info('Starting news fetch job...');

      // Get fetch configuration from environment
      const categories = this.getFetchCategories();
      const sources = this.getFetchSources();
      const query = process.env.FETCH_QUERY || '';
      const pageSize = parseInt(process.env.FETCH_PAGE_SIZE) || 50;
      const maxPages = parseInt(process.env.FETCH_MAX_PAGES) || 3;

      // Run the fetch
      const result = await newsService.fetchNews({
        categories,
        sources,
        query,
        pageSize,
        maxPages
      });

      this.lastResult = result;

      // Log results
      logger.info('News fetch job completed', {
        totalFetched: result.totalFetched,
        totalSaved: result.totalSaved,
        totalSkipped: result.totalSkipped,
        duration: result.duration
      });

      // Store analytics data
      await this.storeFetchAnalytics(result);

      // Update last successful fetch time
      await this.updateLastFetchTime();

      return result;
    } catch (error) {
      logger.error('News fetch job failed:', error);
      
      // Store error analytics
      await this.storeErrorAnalytics(error);
      
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get categories to fetch from environment or defaults
   */
  getFetchCategories() {
    const envCategories = process.env.FETCH_CATEGORIES;
    
    if (envCategories) {
      const categories = envCategories.split(',').map(cat => cat.trim());
      return categories.filter(cat => NEWS_CATEGORIES.includes(cat));
    }

    // Default categories for regular fetching
    return ['technology', 'business', 'science', 'health', 'entertainment'];
  }

  /**
   * Get sources to fetch from environment
   */
  getFetchSources() {
    const envSources = process.env.FETCH_SOURCES;
    
    if (envSources) {
      return envSources.split(',').map(source => source.trim());
    }

    return []; // Empty means fetch from all available sources
  }

  /**
   * Store fetch analytics
   */
  async storeFetchAnalytics(result) {
    try {
      await analyticsService.storeAnalyticsData('news_fetch', {
        success: true,
        totalFetched: result.totalFetched,
        totalSaved: result.totalSaved,
        totalSkipped: result.totalSkipped,
        duration: result.duration,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to store fetch analytics:', error);
    }
  }

  /**
   * Store error analytics
   */
  async storeErrorAnalytics(error) {
    try {
      await analyticsService.storeAnalyticsData('news_fetch_error', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (analyticsError) {
      logger.error('Failed to store error analytics:', analyticsError);
    }
  }

  /**
   * Update last successful fetch time
   */
  async updateLastFetchTime() {
    try {
      const { Analytics } = await import('../models/Analytics.js');
      
      await Analytics.storeSystemHealth({
        lastFetchTime: new Date(),
        fetchStatus: 'success'
      });
    } catch (error) {
      logger.error('Failed to update last fetch time:', error);
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
   * Get next run time (approximate)
   */
  getNextRunTime() {
    if (!this.lastRun) return null;
    
    // Assuming job runs every 2 hours
    const nextRun = new Date(this.lastRun);
    nextRun.setHours(nextRun.getHours() + 2);
    
    return nextRun;
  }

  /**
   * Run fetch for specific categories
   */
  async runForCategories(categories) {
    logger.info(`Running fetch job for categories: ${categories.join(', ')}`);

    return await newsService.fetchNews({
      categories,
      pageSize: 30,
      maxPages: 2
    });
  }

  /**
   * Run fetch for specific sources
   */
  async runForSources(sources) {
    logger.info(`Running fetch job for sources: ${sources.join(', ')}`);

    return await newsService.fetchNews({
      sources,
      pageSize: 30,
      maxPages: 2
    });
  }

  /**
   * Run fetch with custom query
   */
  async runWithQuery(query, options = {}) {
    logger.info(`Running fetch job with query: ${query}`);

    return await newsService.fetchNews({
      query,
      pageSize: options.pageSize || 20,
      maxPages: options.maxPages || 2,
      categories: options.categories || [],
      sources: options.sources || []
    });
  }

  /**
   * Test fetch job (dry run)
   */
  async testRun() {
    logger.info('Running test fetch job...');

    try {
      // Test with minimal parameters
      const result = await newsService.fetchNews({
        categories: ['technology'],
        pageSize: 5,
        maxPages: 1
      });

      logger.info('Test fetch completed successfully', result);
      return result;
    } catch (error) {
      logger.error('Test fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get fetch statistics
   */
  async getStats() {
    try {
      const { Analytics } = await import('../models/Analytics.js');
      
      // Get recent fetch data
      const recentFetches = await Analytics.find({
        type: 'system_health',
        'data.fetchStatus': 'success'
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const totalFetches = recentFetches.length;
      const successfulFetches = recentFetches.filter(fetch => 
        fetch.data.fetchStatus === 'success'
      ).length;

      return {
        totalFetches,
        successfulFetches,
        successRate: totalFetches > 0 ? (successfulFetches / totalFetches) * 100 : 0,
        lastFetch: this.lastRun,
        isRunning: this.isRunning,
        lastResult: this.lastResult
      };
    } catch (error) {
      logger.error('Error getting fetch stats:', error);
      return null;
    }
  }
}

export const fetchJob = new FetchJob();
