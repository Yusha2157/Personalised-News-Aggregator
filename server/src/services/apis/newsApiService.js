/**
 * NewsAPI.org Integration Service
 * Fetches news from NewsAPI.org - one of the most comprehensive news APIs
 */

import axios from 'axios';
import { logger } from '../../config/logger.js';

class NewsApiService {
  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
    this.timeout = 10000;
    
    if (!this.apiKey) {
      logger.warn('NEWSAPI_KEY not configured. NewsAPI service will be disabled.');
    }
  }

  /**
   * Fetch headlines from NewsAPI
   * @param {Object} options - Fetch options
   * @param {string} options.country - Country code (us, uk, ca, etc.)
   * @param {string} options.category - News category
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async fetchHeadlines(options = {}) {
    const {
      country = 'us',
      category = 'general',
      pageSize = 20
    } = options;

    if (!this.apiKey) {
      throw new Error('NewsAPI key not configured');
    }

    try {
      const params = {
        country,
        category,
        pageSize,
        apiKey: this.apiKey
      };

      logger.info('Fetching headlines from NewsAPI', { country, category, pageSize });
      
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      if (response.data.status !== 'ok') {
        throw new Error(`NewsAPI error: ${response.data.message || 'Unknown error'}`);
      }

      return this.normalizeArticles(response.data.articles);

    } catch (error) {
      logger.error('NewsAPI fetch error:', error.message);
      throw new Error(`Failed to fetch from NewsAPI: ${error.message}`);
    }
  }

  /**
   * Search news articles from NewsAPI
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.language - Language code
   * @param {string} options.sortBy - Sort by (publishedAt, relevancy, popularity)
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async searchNews(options = {}) {
    const {
      query = '',
      language = 'en',
      sortBy = 'publishedAt',
      pageSize = 20
    } = options;

    if (!this.apiKey) {
      throw new Error('NewsAPI key not configured');
    }

    if (!query.trim()) {
      return this.fetchHeadlines(options);
    }

    try {
      const params = {
        q: query,
        language,
        sortBy,
        pageSize,
        apiKey: this.apiKey
      };

      logger.info('Searching news from NewsAPI', { query, language, sortBy });
      
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      if (response.data.status !== 'ok') {
        throw new Error(`NewsAPI error: ${response.data.message || 'Unknown error'}`);
      }

      return this.normalizeArticles(response.data.articles);

    } catch (error) {
      logger.error('NewsAPI search error:', error.message);
      throw new Error(`Failed to search NewsAPI: ${error.message}`);
    }
  }

  /**
   * Normalize NewsAPI articles to common format
   * @param {Array} articles - Raw articles from NewsAPI
   * @returns {Array} Normalized articles
   */
  normalizeArticles(articles) {
    return articles
      .filter(article => article.title && article.url)
      .map(article => ({
        id: this.generateId(article),
        title: article.title,
        description: article.description || '',
        url: article.url,
        urlToImage: article.urlToImage || null,
        publishedAt: new Date(article.publishedAt),
        source: {
          id: article.source?.id || 'newsapi',
          name: article.source?.name || 'Unknown Source'
        },
        author: article.author || null,
        category: this.mapCategory(article),
        tags: this.extractTags(article),
        apiSource: 'newsapi',
        raw: article
      }));
  }

  /**
   * Generate unique ID for article
   */
  generateId(article) {
    return `newsapi_${Buffer.from(article.url).toString('base64').slice(0, 16)}`;
  }

  /**
   * Map NewsAPI categories to our internal categories
   */
  mapCategory(article) {
    const categoryMap = {
      'business': 'business',
      'entertainment': 'entertainment',
      'health': 'health',
      'science': 'science',
      'sports': 'sports',
      'technology': 'technology',
      'general': 'general'
    };
    
    return categoryMap[article.category] || 'general';
  }

  /**
   * Extract tags from article content
   */
  extractTags(article) {
    const tags = [];
    
    if (article.title) {
      const titleWords = article.title.toLowerCase().split(' ');
      const commonTags = ['ai', 'technology', 'business', 'politics', 'sports', 'health', 'science'];
      commonTags.forEach(tag => {
        if (titleWords.some(word => word.includes(tag))) {
          tags.push(tag);
        }
      });
    }
    
    return [...new Set(tags)];
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return !!this.apiKey;
  }
}

export const newsApiService = new NewsApiService();
