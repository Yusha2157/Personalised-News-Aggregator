/**
 * The Guardian API Integration Service
 * Fetches news from The Guardian's open API
 */

import axios from 'axios';
import { logger } from '../../config/logger.js';

class GuardianService {
  constructor() {
    this.apiKey = process.env.GUARDIAN_API_KEY;
    this.baseUrl = 'https://content.guardianapis.com';
    this.timeout = 10000;
    
    if (!this.apiKey) {
      logger.warn('GUARDIAN_API_KEY not configured. Guardian service will be disabled.');
    }
  }

  /**
   * Fetch headlines from The Guardian
   * @param {Object} options - Fetch options
   * @param {string} options.section - News section (world, politics, sport, etc.)
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async fetchHeadlines(options = {}) {
    const {
      section = 'world',
      pageSize = 20
    } = options;

    if (!this.apiKey) {
      throw new Error('Guardian API key not configured');
    }

    try {
      const params = {
        'api-key': this.apiKey,
        'section': section,
        'page-size': pageSize,
        'show-fields': 'headline,trailText,thumbnail,byline,publication',
        'show-tags': 'keyword',
        'order-by': 'newest'
      };

      logger.info('Fetching headlines from The Guardian', { section, pageSize });
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      if (response.data.response.status !== 'ok') {
        throw new Error(`Guardian API error: ${response.data.response.message || 'Unknown error'}`);
      }

      return this.normalizeArticles(response.data.response.results);

    } catch (error) {
      logger.error('Guardian API fetch error:', error.message);
      throw new Error(`Failed to fetch from Guardian: ${error.message}`);
    }
  }

  /**
   * Search news articles from The Guardian
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.section - News section
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async searchNews(options = {}) {
    const {
      query = '',
      section = '',
      pageSize = 20
    } = options;

    if (!this.apiKey) {
      throw new Error('Guardian API key not configured');
    }

    try {
      const params = {
        'api-key': this.apiKey,
        'q': query,
        'page-size': pageSize,
        'show-fields': 'headline,trailText,thumbnail,byline,publication',
        'show-tags': 'keyword',
        'order-by': 'newest'
      };

      if (section) {
        params['section'] = section;
      }

      logger.info('Searching news from The Guardian', { query, section, pageSize });
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      if (response.data.response.status !== 'ok') {
        throw new Error(`Guardian API error: ${response.data.response.message || 'Unknown error'}`);
      }

      return this.normalizeArticles(response.data.response.results);

    } catch (error) {
      logger.error('Guardian API search error:', error.message);
      throw new Error(`Failed to search Guardian: ${error.message}`);
    }
  }

  /**
   * Normalize Guardian articles to common format
   * @param {Array} articles - Raw articles from Guardian
   * @returns {Array} Normalized articles
   */
  normalizeArticles(articles) {
    return articles
      .filter(article => article.webTitle && article.webUrl)
      .map(article => ({
        id: this.generateId(article),
        title: article.webTitle,
        description: article.fields?.trailText || '',
        url: article.webUrl,
        urlToImage: article.fields?.thumbnail || null,
        publishedAt: new Date(article.webPublicationDate),
        source: {
          id: 'guardian',
          name: 'The Guardian'
        },
        author: article.fields?.byline || null,
        category: this.mapCategory(article),
        tags: this.extractTags(article),
        apiSource: 'guardian',
        raw: article
      }));
  }

  /**
   * Generate unique ID for article
   */
  generateId(article) {
    return `guardian_${Buffer.from(article.webUrl).toString('base64').slice(0, 16)}`;
  }

  /**
   * Map Guardian sections to our internal categories
   */
  mapCategory(article) {
    const categoryMap = {
      'business': 'business',
      'world': 'politics',
      'politics': 'politics',
      'sport': 'sports',
      'technology': 'technology',
      'science': 'science',
      'culture': 'entertainment',
      'lifeandstyle': 'health',
      'environment': 'science',
      'global-development': 'politics'
    };
    
    return categoryMap[article.sectionId] || 'general';
  }

  /**
   * Extract tags from Guardian article
   */
  extractTags(article) {
    const tags = [];
    
    // Extract from tags
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => {
        if (tag.webTitle) {
          tags.push(tag.webTitle.toLowerCase());
        }
      });
    }
    
    // Extract from title
    if (article.webTitle) {
      const titleWords = article.webTitle.toLowerCase().split(' ');
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

export const guardianService = new GuardianService();
