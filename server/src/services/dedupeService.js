/**
 * Deduplication Service for Personalized News Aggregator
 * Prevents duplicate articles from being stored
 */

import crypto from 'crypto';
import { Article } from '../models/Article.js';
import { logger } from '../config/logger.js';
import { textCleaner } from '../utils/textCleaner.js';

class DedupeService {
  constructor() {
    this.cache = new Map(); // In-memory cache for URL hashes
    this.cacheSize = 10000; // Maximum cache size
  }

  /**
   * Check if an article is a duplicate
   * @param {string} url - Article URL
   * @param {string} title - Article title (optional)
   * @param {string} source - Article source (optional)
   * @param {Date} publishedAt - Publication date (optional)
   * @returns {Promise<boolean>} True if duplicate
   */
  async isDuplicate(url, title = '', source = '', publishedAt = null) {
    try {
      // Primary check: URL-based deduplication
      const urlHash = this.generateUrlHash(url);
      
      if (this.cache.has(urlHash)) {
        return true;
      }

      const existingByUrl = await Article.findOne({ url }).select('_id').lean();
      if (existingByUrl) {
        this.addToCache(urlHash);
        return true;
      }

      // Secondary check: Content-based deduplication
      if (title && source && publishedAt) {
        const contentHash = this.generateContentHash(title, source, publishedAt);
        
        if (this.cache.has(contentHash)) {
          return true;
        }

        const existingByContent = await this.findByContentHash(contentHash);
        if (existingByContent) {
          this.addToCache(contentHash);
          return true;
        }
      }

      // Add to cache as non-duplicate
      this.addToCache(urlHash);
      return false;
    } catch (error) {
      logger.error('Error checking for duplicates:', error);
      return false; // Allow on error to prevent blocking
    }
  }

  /**
   * Generate hash for URL-based deduplication
   */
  generateUrlHash(url) {
    const normalizedUrl = this.normalizeUrl(url);
    return crypto.createHash('sha256').update(normalizedUrl).digest('hex');
  }

  /**
   * Generate hash for content-based deduplication
   */
  generateContentHash(title, source, publishedAt) {
    const normalizedTitle = textCleaner.clean(title);
    const normalizedSource = textCleaner.clean(source);
    const dateStr = new Date(publishedAt).toISOString().split('T')[0]; // YYYY-MM-DD
    
    const content = `${normalizedTitle}|${normalizedSource}|${dateStr}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Normalize URL for consistent hashing
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Remove common tracking parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'ref', 'source', 'campaign'
      ];
      
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      // Normalize protocol and hostname
      const normalized = urlObj.toString().toLowerCase();
      
      // Remove trailing slash and fragments
      return normalized.replace(/\/$/, '').split('#')[0];
    } catch (error) {
      // If URL parsing fails, return original URL
      return url.toLowerCase();
    }
  }

  /**
   * Find existing article by content hash
   */
  async findByContentHash(contentHash) {
    // This is a simplified implementation
    // In a production system, you might want to store content hashes in the database
    // For now, we'll use a combination of title similarity and other factors
    
    // This could be enhanced with fuzzy matching or similarity algorithms
    return null;
  }

  /**
   * Add hash to cache with LRU eviction
   */
  addToCache(hash) {
    if (this.cache.size >= this.cacheSize) {
      // Remove oldest entry (first inserted)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(hash, Date.now());
  }

  /**
   * Check for similar articles using fuzzy matching
   */
  async findSimilarArticles(title, description = '', threshold = 0.8) {
    try {
      const articles = await Article.find({
        $text: { $search: title },
        isActive: true
      }).limit(100);

      const similar = [];
      const normalizedTitle = textCleaner.clean(title).toLowerCase();
      const normalizedDescription = textCleaner.clean(description).toLowerCase();

      for (const article of articles) {
        const similarity = this.calculateSimilarity(
          normalizedTitle,
          textCleaner.clean(article.title).toLowerCase()
        );

        if (similarity >= threshold) {
          similar.push({
            article,
            similarity
          });
        }
      }

      return similar.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      logger.error('Error finding similar articles:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two strings using Jaccard similarity
   */
  calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Remove duplicate articles from database
   */
  async removeDuplicates() {
    try {
      logger.info('Starting duplicate removal process');
      
      const duplicates = await this.findDuplicates();
      let removedCount = 0;

      for (const group of duplicates) {
        // Keep the first article, remove the rest
        const toKeep = group[0];
        const toRemove = group.slice(1);

        for (const duplicate of toRemove) {
          await Article.findByIdAndDelete(duplicate._id);
          removedCount++;
        }

        logger.debug(`Removed ${toRemove.length} duplicates for article: ${toKeep.title}`);
      }

      logger.info(`Duplicate removal completed. Removed ${removedCount} articles`);
      return { removedCount, duplicateGroups: duplicates.length };
    } catch (error) {
      logger.error('Error removing duplicates:', error);
      throw error;
    }
  }

  /**
   * Find duplicate articles in database
   */
  async findDuplicates() {
    const pipeline = [
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$url',
          articles: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      },
      {
        $project: {
          articles: 1,
          count: 1
        }
      }
    ];

    const result = await Article.aggregate(pipeline);
    return result.map(group => group.articles);
  }

  /**
   * Get deduplication statistics
   */
  async getStats() {
    try {
      const totalArticles = await Article.countDocuments({ isActive: true });
      const duplicates = await this.findDuplicates();
      const duplicateCount = duplicates.reduce((sum, group) => sum + group.length - 1, 0);
      
      return {
        totalArticles,
        duplicateGroups: duplicates.length,
        duplicateCount,
        uniqueArticles: totalArticles - duplicateCount,
        cacheSize: this.cache.size,
        cacheMaxSize: this.cacheSize
      };
    } catch (error) {
      logger.error('Error getting deduplication stats:', error);
      return null;
    }
  }

  /**
   * Clear deduplication cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Deduplication cache cleared');
  }

  /**
   * Initialize deduplication service
   */
  async initialize() {
    try {
      // Pre-populate cache with existing URLs
      const existingArticles = await Article.find({ isActive: true })
        .select('url')
        .limit(1000)
        .lean();

      for (const article of existingArticles) {
        const hash = this.generateUrlHash(article.url);
        this.addToCache(hash);
      }

      logger.info(`Deduplication service initialized with ${this.cache.size} cached URLs`);
    } catch (error) {
      logger.error('Error initializing deduplication service:', error);
    }
  }
}

export const dedupeService = new DedupeService();
