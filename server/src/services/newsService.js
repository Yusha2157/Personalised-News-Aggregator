/**
 * News Service for Personalized News Aggregator
 * Comprehensive news fetching from NewsAPI with advanced features
 */

import axios from 'axios';
import { Article } from '../models/Article.js';
import { NEWSAPI_CONFIG, NEWS_CATEGORIES } from '../config/constants.js';
import { logger } from '../config/logger.js';
import { dedupeService } from './dedupeService.js';
import { taggerService } from './taggerService.js';
import { cacheService } from './cacheService.js';

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY;
    this.baseUrl = NEWSAPI_CONFIG.BASE_URL;
    this.timeout = NEWSAPI_CONFIG.TIMEOUT;
    
    if (!this.apiKey) {
      logger.warn('NEWSAPI_KEY not found. News fetching will be limited.');
    }
  }

  /**
   * Fetch news articles from NewsAPI
   * @param {Object} options - Fetch options
   * @param {string[]} options.categories - Categories to fetch
   * @param {string[]} options.sources - Specific sources to fetch from
   * @param {string} options.query - Search query
   * @param {number} options.pageSize - Number of articles per page
   * @param {number} options.maxPages - Maximum pages to fetch
   * @returns {Promise<Object>} Fetch results
   */
  async fetchNews(options = {}) {
    const {
      categories = NEWS_CATEGORIES,
      sources = [],
      query = '',
      pageSize = NEWSAPI_CONFIG.PAGE_SIZE,
      maxPages = NEWSAPI_CONFIG.MAX_PAGES
    } = options;

    if (!this.apiKey) {
      throw new Error('NewsAPI key not configured');
    }

    logger.info('Starting news fetch', {
      categories,
      sources,
      query,
      pageSize,
      maxPages
    });

    const startTime = Date.now();
    let totalFetched = 0;
    let totalSaved = 0;
    let totalSkipped = 0;

    try {
      // Fetch from multiple sources/categories
      const fetchPromises = [];

      if (sources.length > 0) {
        // Fetch from specific sources
        fetchPromises.push(this.fetchFromSources(sources, query, pageSize, maxPages));
      } else {
        // Fetch by categories
        for (const category of categories) {
          fetchPromises.push(this.fetchFromCategory(category, query, pageSize, maxPages));
        }
      }

      const results = await Promise.all(fetchPromises);
      const allArticles = results.flat();

      logger.info(`Fetched ${allArticles.length} articles from API`);

      // Process and save articles
      for (const articleData of allArticles) {
        try {
          const processed = await this.processArticle(articleData);
          
          if (processed.saved) {
            totalSaved++;
          } else {
            totalSkipped++;
          }
          
          totalFetched++;
        } catch (error) {
          logger.error('Error processing article:', error);
          totalSkipped++;
        }
      }

      const duration = Date.now() - startTime;
      
      const result = {
        success: true,
        totalFetched,
        totalSaved,
        totalSkipped,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };

      logger.info('News fetch completed', result);
      
      // Invalidate relevant caches
      await this.invalidateCaches(categories, sources);
      
      return result;
    } catch (error) {
      logger.error('News fetch failed:', error);
      throw error;
    }
  }

  /**
   * Fetch articles from specific sources
   */
  async fetchFromSources(sources, query, pageSize, maxPages) {
    const articles = [];
    
    for (const source of sources) {
      try {
        const sourceArticles = await this.fetchFromSource(source, query, pageSize, maxPages);
        articles.push(...sourceArticles);
      } catch (error) {
        logger.error(`Error fetching from source ${source}:`, error);
      }
    }
    
    return articles;
  }

  /**
   * Fetch articles from a specific source
   */
  async fetchFromSource(source, query, pageSize, maxPages) {
    const articles = [];
    let page = 1;

    while (page <= maxPages) {
      try {
        const params = {
          sources: source,
          pageSize: Math.min(pageSize, 100), // NewsAPI max is 100
          page,
          apiKey: this.apiKey,
          sortBy: 'publishedAt'
        };

        if (query) {
          params.q = query;
        }

        const response = await axios.get(`${this.baseUrl}/everything`, {
          params,
          timeout: this.timeout
        });

        if (response.data.status === 'ok') {
          articles.push(...response.data.articles);
          
          if (response.data.articles.length < pageSize) {
            break; // No more articles
          }
          
          page++;
        } else {
          logger.error(`NewsAPI error for source ${source}:`, response.data);
          break;
        }
      } catch (error) {
        logger.error(`Error fetching from source ${source}, page ${page}:`, error);
        break;
      }
    }

    return articles;
  }

  /**
   * Fetch articles from a specific category
   */
  async fetchFromCategory(category, query, pageSize, maxPages) {
    const articles = [];
    let page = 1;

    while (page <= maxPages) {
      try {
        const params = {
          category,
          pageSize: Math.min(pageSize, 100),
          page,
          apiKey: this.apiKey,
          sortBy: 'publishedAt',
          country: 'us' // You can make this configurable
        };

        if (query) {
          params.q = query;
        }

        const response = await axios.get(`${this.baseUrl}/top-headlines`, {
          params,
          timeout: this.timeout
        });

        if (response.data.status === 'ok') {
          articles.push(...response.data.articles);
          
          if (response.data.articles.length < pageSize) {
            break;
          }
          
          page++;
        } else {
          logger.error(`NewsAPI error for category ${category}:`, response.data);
          break;
        }
      } catch (error) {
        logger.error(`Error fetching category ${category}, page ${page}:`, error);
        break;
      }
    }

    return articles;
  }

  /**
   * Process and save a single article
   */
  async processArticle(articleData) {
    try {
      // Normalize article data
      const normalized = this.normalizeArticle(articleData);
      
      // Check for duplicates
      const isDuplicate = await dedupeService.isDuplicate(normalized.url);
      if (isDuplicate) {
        logger.debug(`Skipping duplicate article: ${normalized.title}`);
        return { saved: false, reason: 'duplicate' };
      }

      // Generate tags using TF-IDF
      const tags = await taggerService.extractTags(normalized.title, normalized.description);
      normalized.tags = tags;

      // Auto-categorize if not provided
      if (!normalized.category) {
        normalized.category = this.categorizeArticle(normalized);
      }

      // Create article document
      const article = new Article(normalized);
      await article.save();

      logger.debug(`Saved article: ${normalized.title}`);
      return { saved: true, article };
    } catch (error) {
      logger.error('Error processing article:', error);
      return { saved: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Normalize article data from NewsAPI
   */
  normalizeArticle(data) {
    return {
      title: data.title || '',
      description: data.description || '',
      url: data.url,
      urlToImage: data.urlToImage || null,
      source: {
        id: data.source?.id || '',
        name: data.source?.name || 'Unknown'
      },
      author: data.author || null,
      publishedAt: new Date(data.publishedAt),
      fetchedAt: new Date(),
      meta: {
        score: 0,
        wordCount: this.calculateWordCount(data.title, data.description),
        readingTime: 0
      }
    };
  }

  /**
   * Calculate word count for reading time estimation
   */
  calculateWordCount(title, description) {
    const text = `${title || ''} ${description || ''}`;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Categorize article based on content
   */
  categorizeArticle(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    const categoryKeywords = {
      technology: ['tech', 'software', 'ai', 'artificial intelligence', 'startup', 'google', 'microsoft', 'apple'],
      business: ['business', 'market', 'stock', 'revenue', 'earnings', 'economy', 'finance'],
      sports: ['sport', 'football', 'basketball', 'soccer', 'baseball', 'tennis', 'olympics'],
      health: ['health', 'medical', 'doctor', 'hospital', 'covid', 'vaccine', 'treatment'],
      science: ['science', 'research', 'study', 'discovery', 'experiment', 'space', 'nasa'],
      entertainment: ['movie', 'film', 'music', 'celebrity', 'show', 'television', 'hollywood'],
      politics: ['politics', 'government', 'election', 'president', 'minister', 'congress']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Invalidate relevant caches after fetching
   */
  async invalidateCaches(categories, sources) {
    try {
      const cacheKeys = [
        'articles:*',
        'trending:*'
      ];

      // Add category-specific cache keys
      for (const category of categories) {
        cacheKeys.push(`articles:category:${category}:*`);
      }

      // Add source-specific cache keys
      for (const source of sources) {
        cacheKeys.push(`articles:source:${source}:*`);
      }

      await cacheService.invalidatePattern(cacheKeys);
    } catch (error) {
      logger.error('Error invalidating caches:', error);
    }
  }

  /**
   * Get available sources from NewsAPI
   */
  async getAvailableSources() {
    if (!this.apiKey) {
      throw new Error('NewsAPI key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/sources`, {
        params: { apiKey: this.apiKey },
        timeout: this.timeout
      });

      return response.data.sources || [];
    } catch (error) {
      logger.error('Error fetching sources:', error);
      throw error;
    }
  }

  /**
   * Get source categories
   */
  async getSourceCategories() {
    const sources = await this.getAvailableSources();
    const categories = [...new Set(sources.map(source => source.category))];
    return categories.filter(Boolean);
  }
}

export const newsService = new NewsService();


