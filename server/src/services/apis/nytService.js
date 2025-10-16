/**
 * New York Times API Integration Service
 * Fetches news from The New York Times API
 */

import axios from 'axios';
import { logger } from '../../config/logger.js';

class NytService {
  constructor() {
    this.apiKey = process.env.NYT_API_KEY;
    this.baseUrl = 'https://api.nytimes.com/svc';
    this.timeout = 10000;
    
    if (!this.apiKey) {
      logger.warn('NYT_API_KEY not configured. New York Times service will be disabled.');
    }
  }

  /**
   * Fetch headlines from New York Times
   * @param {Object} options - Fetch options
   * @param {string} options.section - News section (world, business, sports, etc.)
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async fetchHeadlines(options = {}) {
    const {
      section = 'world',
      pageSize = 20
    } = options;

    if (!this.apiKey) {
      throw new Error('NYT API key not configured');
    }

    try {
      const params = {
        'api-key': this.apiKey
      };

      logger.info('Fetching headlines from New York Times', { section, pageSize });
      
      const response = await axios.get(`${this.baseUrl}/topstories/v2/${section}.json`, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      if (!response.data.results) {
        throw new Error('Invalid response from NYT API');
      }

      // Limit results to requested pageSize
      const limitedResults = response.data.results.slice(0, pageSize);
      return this.normalizeArticles(limitedResults);

    } catch (error) {
      logger.error('NYT API fetch error:', error.message);
      throw new Error(`Failed to fetch from NYT: ${error.message}`);
    }
  }

  /**
   * Search news articles from New York Times
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async searchNews(options = {}) {
    const {
      query = '',
      pageSize = 20
    } = options;

    if (!this.apiKey) {
      throw new Error('NYT API key not configured');
    }

    if (!query.trim()) {
      return this.fetchHeadlines(options);
    }

    try {
      const params = {
        'api-key': this.apiKey,
        'q': query,
        'sort': 'newest',
        'fl': 'headline,abstract,web_url,multimedia,byline,pub_date,section_name'
      };

      logger.info('Searching news from New York Times', { query, pageSize });
      
      const response = await axios.get(`${this.baseUrl}/search/v2/articlesearch.json`, {
        params,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      if (!response.data.response || !response.data.response.docs) {
        throw new Error('Invalid response from NYT search API');
      }

      // Limit results to requested pageSize
      const limitedResults = response.data.response.docs.slice(0, pageSize);
      return this.normalizeArticles(limitedResults);

    } catch (error) {
      logger.error('NYT API search error:', error.message);
      throw new Error(`Failed to search NYT: ${error.message}`);
    }
  }

  /**
   * Normalize NYT articles to common format
   * @param {Array} articles - Raw articles from NYT
   * @returns {Array} Normalized articles
   */
  normalizeArticles(articles) {
    return articles
      .filter(article => article.headline && article.web_url)
      .map(article => ({
        id: this.generateId(article),
        title: article.headline?.main || article.title || '',
        description: article.abstract || article.snippet || '',
        url: article.web_url,
        urlToImage: this.extractImageUrl(article),
        publishedAt: new Date(article.pub_date || article.published_date),
        source: {
          id: 'nyt',
          name: 'The New York Times'
        },
        author: this.extractAuthor(article),
        category: this.mapCategory(article),
        tags: this.extractTags(article),
        apiSource: 'nyt',
        raw: article
      }));
  }

  /**
   * Generate unique ID for article
   */
  generateId(article) {
    const url = article.web_url || article.url;
    return `nyt_${Buffer.from(url).toString('base64').slice(0, 16)}`;
  }

  /**
   * Extract image URL from NYT article
   */
  extractImageUrl(article) {
    if (article.multimedia && Array.isArray(article.multimedia)) {
      // Find the largest image
      const images = article.multimedia.filter(img => img.subtype === 'large' || img.subtype === 'medium');
      if (images.length > 0) {
        return `https://static01.nyt.com/${images[0].url}`;
      }
    }
    
    if (article.media && Array.isArray(article.media)) {
      const media = article.media[0];
      if (media && media['media-metadata']) {
        const largeImage = media['media-metadata'].find(meta => meta.format === 'Large');
        if (largeImage) {
          return largeImage.url;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract author from NYT article
   */
  extractAuthor(article) {
    if (article.byline && article.byline.original) {
      return article.byline.original.replace('By ', '');
    }
    
    if (article.byline && typeof article.byline === 'string') {
      return article.byline.replace('By ', '');
    }
    
    return null;
  }

  /**
   * Map NYT sections to our internal categories
   */
  mapCategory(article) {
    const categoryMap = {
      'Business': 'business',
      'World': 'politics',
      'U.S.': 'politics',
      'Politics': 'politics',
      'Sports': 'sports',
      'Technology': 'technology',
      'Science': 'science',
      'Health': 'health',
      'Arts': 'entertainment',
      'Movies': 'entertainment',
      'Books': 'entertainment',
      'Food': 'health',
      'Travel': 'general',
      'Real Estate': 'business',
      'Automobiles': 'technology'
    };
    
    const section = article.section_name || article.section;
    return categoryMap[section] || 'general';
  }

  /**
   * Extract tags from NYT article
   */
  extractTags(article) {
    const tags = [];
    
    // Extract from section
    if (article.section_name) {
      tags.push(article.section_name.toLowerCase());
    }
    
    // Extract from subsection
    if (article.subsection_name) {
      tags.push(article.subsection_name.toLowerCase());
    }
    
    // Extract from keywords/des_facet
    if (article.des_facet && Array.isArray(article.des_facet)) {
      article.des_facet.forEach(keyword => {
        if (keyword) {
          tags.push(keyword.toLowerCase());
        }
      });
    }
    
    // Extract from title
    if (article.headline?.main) {
      const titleWords = article.headline.main.toLowerCase().split(' ');
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

export const nytService = new NytService();
