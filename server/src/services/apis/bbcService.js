/**
 * BBC News API Integration Service
 * Fetches news from BBC News (using RSS feeds as BBC doesn't have a public API)
 */

import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { logger } from '../../config/logger.js';

const parseXML = promisify(parseString);

class BbcService {
  constructor() {
    this.baseUrl = 'https://feeds.bbci.co.uk';
    this.timeout = 10000;
    this.feedUrls = {
      world: `${this.baseUrl}/news/world/rss.xml`,
      uk: `${this.baseUrl}/news/uk/rss.xml`,
      business: `${this.baseUrl}/news/business/rss.xml`,
      technology: `${this.baseUrl}/news/technology/rss.xml`,
      science: `${this.baseUrl}/news/science_and_environment/rss.xml`,
      health: `${this.baseUrl}/news/health/rss.xml`,
      sport: `${this.baseUrl}/sport/rss.xml`
    };
  }

  /**
   * Fetch headlines from BBC News
   * @param {Object} options - Fetch options
   * @param {string} options.category - News category
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async fetchHeadlines(options = {}) {
    const {
      category = 'world',
      pageSize = 20
    } = options;

    try {
      const feedUrl = this.feedUrls[category] || this.feedUrls.world;
      
      logger.info('Fetching headlines from BBC News', { category, pageSize });
      
      const response = await axios.get(feedUrl, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'NewsAggregator/1.0'
        }
      });

      const parsedData = await parseXML(response.data);
      const items = parsedData.rss.channel[0].item || [];
      
      // Limit results to requested pageSize
      const limitedItems = items.slice(0, pageSize);
      return this.normalizeArticles(limitedItems);

    } catch (error) {
      logger.error('BBC News fetch error:', error.message);
      throw new Error(`Failed to fetch from BBC: ${error.message}`);
    }
  }

  /**
   * Search news articles from BBC News
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.category - News category
   * @param {number} options.pageSize - Number of articles to fetch
   * @returns {Promise<Array>} Normalized news articles
   */
  async searchNews(options = {}) {
    const {
      query = '',
      category = 'world',
      pageSize = 20
    } = options;

    try {
      // Get all articles from the category
      const articles = await this.fetchHeadlines({ category, pageSize: 50 });
      
      if (!query.trim()) {
        return articles.slice(0, pageSize);
      }

      // Filter articles based on search query
      const searchQuery = query.toLowerCase();
      const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery) ||
        article.description.toLowerCase().includes(searchQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );

      return filteredArticles.slice(0, pageSize);

    } catch (error) {
      logger.error('BBC News search error:', error.message);
      throw new Error(`Failed to search BBC: ${error.message}`);
    }
  }

  /**
   * Normalize BBC RSS articles to common format
   * @param {Array} articles - Raw articles from BBC RSS
   * @returns {Array} Normalized articles
   */
  normalizeArticles(articles) {
    return articles
      .filter(article => article.title && article.link)
      .map(article => ({
        id: this.generateId(article),
        title: article.title[0],
        description: article.description ? article.description[0] : '',
        url: article.link[0],
        urlToImage: this.extractImageUrl(article),
        publishedAt: new Date(article.pubDate[0]),
        source: {
          id: 'bbc',
          name: 'BBC News'
        },
        author: null, // BBC RSS doesn't include author info
        category: this.mapCategory(article),
        tags: this.extractTags(article),
        apiSource: 'bbc',
        raw: article
      }));
  }

  /**
   * Generate unique ID for article
   */
  generateId(article) {
    return `bbc_${Buffer.from(article.link[0]).toString('base64').slice(0, 16)}`;
  }

  /**
   * Extract image URL from BBC article
   */
  extractImageUrl(article) {
    if (article['media:thumbnail'] && article['media:thumbnail'][0]) {
      return article['media:thumbnail'][0].$.url;
    }
    
    if (article['media:content'] && article['media:content'][0]) {
      const media = article['media:content'][0];
      if (media.$ && media.$.url) {
        return media.$.url;
      }
    }
    
    return null;
  }

  /**
   * Map BBC categories to our internal categories
   */
  mapCategory(article) {
    const categoryMap = {
      'business': 'business',
      'technology': 'technology',
      'science_and_environment': 'science',
      'health': 'health',
      'sport': 'sports',
      'world': 'politics',
      'uk': 'politics'
    };
    
    // Extract category from link or use default
    const link = article.link[0];
    for (const [bbcCategory, ourCategory] of Object.entries(categoryMap)) {
      if (link.includes(bbcCategory)) {
        return ourCategory;
      }
    }
    
    return 'general';
  }

  /**
   * Extract tags from BBC article
   */
  extractTags(article) {
    const tags = [];
    
    // Extract from categories
    if (article.category && Array.isArray(article.category)) {
      article.category.forEach(cat => {
        if (cat) {
          tags.push(cat.toLowerCase());
        }
      });
    }
    
    // Extract from title
    if (article.title && article.title[0]) {
      const titleWords = article.title[0].toLowerCase().split(' ');
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
    return true; // BBC RSS feeds are always available
  }
}

export const bbcService = new BbcService();
