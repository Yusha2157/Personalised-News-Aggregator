/**
 * Cache Service for Personalized News Aggregator
 * Redis-based caching with intelligent invalidation
 */

import { getRedis } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { CACHE_TTL } from '../config/constants.js';

class CacheService {
  constructor() {
    this.redis = null;
    this.defaultTTL = CACHE_TTL.ARTICLES_LIST;
    this.prefix = 'news-aggregator:';
  }

  /**
   * Initialize cache service
   */
  async initialize() {
    try {
      this.redis = getRedis();
      logger.info('Cache service initialized');
    } catch (error) {
      logger.error('Failed to initialize cache service:', error);
    }
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      if (!this.redis) return null;

      const fullKey = this.getFullKey(key);
      const value = await this.redis.get(fullKey);
      
      if (value) {
        return JSON.parse(value);
      }
      
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.redis) return false;

      const fullKey = this.getFullKey(key);
      const serializedValue = JSON.stringify(value);
      
      await this.redis.setex(fullKey, ttl, serializedValue);
      
      logger.debug(`Cached value for key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cached value
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      if (!this.redis) return false;

      const fullKey = this.getFullKey(key);
      const result = await this.redis.del(fullKey);
      
      logger.debug(`Deleted cache key: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Existence status
   */
  async exists(key) {
    try {
      if (!this.redis) return false;

      const fullKey = this.getFullKey(key);
      const result = await this.redis.exists(fullKey);
      
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple cached values
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  async mget(keys) {
    try {
      if (!this.redis || keys.length === 0) return {};

      const fullKeys = keys.map(key => this.getFullKey(key));
      const values = await this.redis.mget(...fullKeys);
      
      const result = {};
      for (let i = 0; i < keys.length; i++) {
        if (values[i]) {
          result[keys[i]] = JSON.parse(values[i]);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Cache mget error:', error);
      return {};
    }
  }

  /**
   * Set multiple cached values
   * @param {Object} keyValues - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async mset(keyValues, ttl = this.defaultTTL) {
    try {
      if (!this.redis) return false;

      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValues)) {
        const fullKey = this.getFullKey(key);
        const serializedValue = JSON.stringify(value);
        pipeline.setex(fullKey, ttl, serializedValue);
      }
      
      await pipeline.exec();
      
      logger.debug(`Cached ${Object.keys(keyValues).length} values`);
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern
   * @param {string|string[]} patterns - Pattern(s) to match
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidatePattern(patterns) {
    try {
      if (!this.redis) return 0;

      const patternArray = Array.isArray(patterns) ? patterns : [patterns];
      let totalDeleted = 0;

      for (const pattern of patternArray) {
        const fullPattern = this.getFullKey(pattern);
        const keys = await this.redis.keys(fullPattern);
        
        if (keys.length > 0) {
          const deleted = await this.redis.del(...keys);
          totalDeleted += deleted;
        }
      }

      logger.info(`Invalidated ${totalDeleted} cache keys matching patterns: ${patternArray.join(', ')}`);
      return totalDeleted;
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    try {
      if (!this.redis) return null;

      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      // Parse Redis info
      const memoryInfo = this.parseRedisInfo(info);
      const keyspaceInfo = this.parseRedisInfo(keyspace);
      
      return {
        memory: memoryInfo,
        keyspace: keyspaceInfo,
        connected: true
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      if (!this.redis) return false;

      const pattern = this.getFullKey('*');
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      logger.info(`Cleared ${keys.length} cache keys`);
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key) {
    try {
      if (!this.redis) return -2;

      const fullKey = this.getFullKey(key);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Extend TTL for a key
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in seconds
   * @returns {Promise<boolean>} Success status
   */
  async extendTTL(key, ttl) {
    try {
      if (!this.redis) return false;

      const fullKey = this.getFullKey(key);
      const result = await this.redis.expire(fullKey, ttl);
      
      return result === 1;
    } catch (error) {
      logger.error(`Cache extend TTL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Cache with callback (cache-aside pattern)
   * @param {string} key - Cache key
   * @param {Function} callback - Function to call if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or computed value
   */
  async remember(key, callback, ttl = this.defaultTTL) {
    try {
      // Try to get from cache first
      let value = await this.get(key);
      
      if (value !== null) {
        return value;
      }

      // Cache miss - compute value
      value = await callback();
      
      // Store in cache
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      logger.error(`Cache remember error for key ${key}:`, error);
      // Return computed value even if caching fails
      return await callback();
    }
  }

  /**
   * Get full cache key with prefix
   */
  getFullKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Parse Redis info string
   */
  parseRedisInfo(info) {
    const result = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.redis) {
        return { status: 'disconnected', error: 'Redis not initialized' };
      }

      const result = await this.redis.ping();
      return {
        status: result === 'PONG' ? 'healthy' : 'unhealthy',
        response: result
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

export const cacheService = new CacheService();
