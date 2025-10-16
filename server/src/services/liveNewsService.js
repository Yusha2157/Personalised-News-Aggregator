/**
 * Live News Aggregator Service
 * Combines multiple news APIs to provide comprehensive, real-time news
 */

import { logger } from '../config/logger.js';
import { cacheService } from './cacheService.js';
import { newsApiService } from './apis/newsApiService.js';
import { guardianService } from './apis/guardianService.js';
import { nytService } from './apis/nytService.js';
import { bbcService } from './apis/bbcService.js';

class LiveNewsService {
  constructor() {
    this.services = [
      { name: 'NewsAPI', service: newsApiService, weight: 1.0 },
      { name: 'Guardian', service: guardianService, weight: 0.9 },
      { name: 'NYT', service: nytService, weight: 0.9 },
      { name: 'BBC', service: bbcService, weight: 0.8 }
    ];
    
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch live news from all available sources
   * @param {Object} options - Fetch options
   * @param {string} options.category - News category
   * @param {string} options.query - Search query
   * @param {number} options.limit - Maximum number of articles
   * @param {boolean} options.useCache - Whether to use cached results
   * @returns {Promise<Object>} Aggregated news results
   */
  async fetchLiveNews(options = {}) {
    const {
      category = 'general',
      query = '',
      limit = 50,
      useCache = true
    } = options;

    // Generate cache key
    const cacheKey = `live_news:${category}:${query}:${limit}`;
    
    // Try cache first
    if (useCache) {
      try {
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          logger.info('Returning cached live news', { category, query, limit });
          return cached;
        }
      } catch (error) {
        logger.warn('Cache error:', error.message);
      }
    }

    logger.info('Fetching live news from all sources', { category, query, limit });

    try {
      const results = await this.fetchFromAllSources(options);
      const processedResults = this.processResults(results, limit);
      
      // Cache the results
      if (useCache) {
        try {
          await cacheService.set(cacheKey, processedResults, this.cacheTimeout);
        } catch (error) {
          logger.warn('Failed to cache results:', error.message);
        }
      }

      return processedResults;

    } catch (error) {
      logger.error('Live news fetch error:', error.message);
      throw new Error(`Failed to fetch live news: ${error.message}`);
    }
  }

  /**
   * Fetch news from all available sources in parallel
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Results from all sources
   */
  async fetchFromAllSources(options) {
    const promises = this.services
      .filter(({ service }) => service.isAvailable())
      .map(async ({ name, service }) => {
        try {
          const startTime = Date.now();
          let articles;
          
          if (options.query) {
            articles = await service.searchNews(options);
          } else {
            articles = await service.fetchHeadlines(options);
          }
          
          const duration = Date.now() - startTime;
          logger.info(`Fetched ${articles.length} articles from ${name}`, { duration });
          
          return {
            source: name,
            articles,
            count: articles.length,
            success: true,
            duration
          };
        } catch (error) {
          logger.error(`Failed to fetch from ${name}:`, error.message);
          return {
            source: name,
            articles: [],
            count: 0,
            success: false,
            error: error.message
          };
        }
      });

    const results = await Promise.all(promises);
    
    return {
      sources: results,
      totalArticles: results.reduce((sum, result) => sum + result.count, 0),
      successfulSources: results.filter(result => result.success).length,
      failedSources: results.filter(result => !result.success).length
    };
  }

  /**
   * Process and combine results from all sources
   * @param {Object} results - Raw results from all sources
   * @param {number} limit - Maximum number of articles to return
   * @returns {Object} Processed and deduplicated results
   */
  processResults(results, limit) {
    // Combine all articles
    const allArticles = [];
    results.sources.forEach(source => {
      if (source.success) {
        source.articles.forEach(article => {
          allArticles.push({
            ...article,
            sourceWeight: this.getSourceWeight(source.source)
          });
        });
      }
    });

    // Deduplicate articles
    const deduplicatedArticles = this.deduplicateArticles(allArticles);

    // Sort by date and weight
    const sortedArticles = deduplicatedArticles.sort((a, b) => {
      // First sort by date (newest first)
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Then sort by source weight
      return b.sourceWeight - a.sourceWeight;
    });

    // Limit results
    const limitedArticles = sortedArticles.slice(0, limit);

    // Calculate statistics
    const sourceStats = this.calculateSourceStats(limitedArticles);
    const categoryStats = this.calculateCategoryStats(limitedArticles);

    return {
      articles: limitedArticles,
      metadata: {
        totalArticles: limitedArticles.length,
        sourcesUsed: results.successfulSources,
        sourcesFailed: results.failedSources,
        sourceBreakdown: sourceStats,
        categoryBreakdown: categoryStats,
        fetchedAt: new Date().toISOString(),
        cacheHit: false
      }
    };
  }

  /**
   * Deduplicate articles based on title similarity and URL
   * @param {Array} articles - Array of articles to deduplicate
   * @returns {Array} Deduplicated articles
   */
  deduplicateArticles(articles) {
    const seen = new Set();
    const deduplicated = [];

    articles.forEach(article => {
      // Create a signature for the article
      const titleSignature = article.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const urlSignature = article.url;

      // Check if we've seen a similar article
      const isDuplicate = seen.has(urlSignature) || 
        Array.from(seen).some(signature => {
          if (signature.startsWith('title:')) {
            const existingTitle = signature.replace('title:', '');
            return this.calculateSimilarity(titleSignature, existingTitle) > 0.8;
          }
          return false;
        });

      if (!isDuplicate) {
        seen.add(urlSignature);
        seen.add(`title:${titleSignature}`);
        deduplicated.push(article);
      }
    });

    return deduplicated;
  }

  /**
   * Calculate similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Get source weight for ranking
   * @param {string} sourceName - Name of the news source
   * @returns {number} Weight value
   */
  getSourceWeight(sourceName) {
    const source = this.services.find(s => s.name === sourceName);
    return source ? source.weight : 0.5;
  }

  /**
   * Calculate source statistics
   * @param {Array} articles - Array of articles
   * @returns {Object} Source statistics
   */
  calculateSourceStats(articles) {
    const stats = {};
    articles.forEach(article => {
      const sourceName = article.apiSource;
      stats[sourceName] = (stats[sourceName] || 0) + 1;
    });
    return stats;
  }

  /**
   * Calculate category statistics
   * @param {Array} articles - Array of articles
   * @returns {Object} Category statistics
   */
  calculateCategoryStats(articles) {
    const stats = {};
    articles.forEach(article => {
      const category = article.category;
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }

  /**
   * Get available news sources
   * @returns {Array} List of available sources
   */
  getAvailableSources() {
    return this.services
      .filter(({ service }) => service.isAvailable())
      .map(({ name, service }) => ({
        name,
        available: true
      }));
  }

  /**
   * Health check for all services
   * @returns {Promise<Object>} Health status of all services
   */
  async healthCheck() {
    const healthStatus = {};
    
    for (const { name, service } of this.services) {
      try {
        const startTime = Date.now();
        
        if (!service.isAvailable()) {
          healthStatus[name] = {
            status: 'disabled',
            message: 'API key not configured',
            responseTime: null
          };
          continue;
        }

        // Try to fetch a small number of articles
        const articles = await service.fetchHeadlines({ pageSize: 1 });
        const responseTime = Date.now() - startTime;
        
        healthStatus[name] = {
          status: 'healthy',
          message: `Fetched ${articles.length} articles`,
          responseTime,
          articlesCount: articles.length
        };
      } catch (error) {
        healthStatus[name] = {
          status: 'error',
          message: error.message,
          responseTime: null
        };
      }
    }
    
    return healthStatus;
  }
}

export const liveNewsService = new LiveNewsService();
