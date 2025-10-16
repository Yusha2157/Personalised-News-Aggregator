/**
 * Test Setup Configuration
 * Global test configuration and utilities
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.REDIS_URL = 'redis://localhost:6379';
  
  // Mock Redis for tests
  jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
      flushall: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn().mockResolvedValue('OK')
    }));
  });

  // Mock NewsAPI for tests
  jest.mock('axios', () => ({
    get: jest.fn().mockResolvedValue({
      data: {
        status: 'ok',
        totalResults: 2,
        articles: [
          {
            title: 'Test Article 1',
            description: 'Test description 1',
            url: 'https://example.com/article1',
            urlToImage: 'https://example.com/image1.jpg',
            publishedAt: '2024-01-15T10:00:00Z',
            source: { id: 'test-source', name: 'Test Source' }
          },
          {
            title: 'Test Article 2',
            description: 'Test description 2',
            url: 'https://example.com/article2',
            urlToImage: 'https://example.com/image2.jpg',
            publishedAt: '2024-01-14T10:00:00Z',
            source: { id: 'test-source', name: 'Test Source' }
          }
        ]
      }
    })
  }));

  // Mock cron jobs for tests
  jest.mock('node-cron', () => ({
    schedule: jest.fn()
  }));

  // Mock Winston logger for tests
  jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    })),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      simple: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  }));
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Test utilities
export const testUtils = {
  /**
   * Create a test user
   */
  createTestUser: async (userData = {}) => {
    const User = (await import('../src/models/User.js')).default;
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      ...userData
    });
    await user.save();
    return user;
  },

  /**
   * Create a test admin user
   */
  createTestAdmin: async (userData = {}) => {
    const User = (await import('../src/models/User.js')).default;
    const admin = new User({
      email: 'admin@example.com',
      password: 'password123',
      name: 'Test Admin',
      role: 'admin',
      ...userData
    });
    await admin.save();
    return admin;
  },

  /**
   * Create test articles
   */
  createTestArticles: async (count = 3) => {
    const Article = (await import('../src/models/Article.js')).default;
    const articles = Array.from({ length: count }, (_, i) => ({
      title: `Test Article ${i + 1}`,
      description: `Test description ${i + 1}`,
      url: `https://example.com/article${i + 1}`,
      urlToImage: `https://example.com/image${i + 1}.jpg`,
      source: { id: 'test-source', name: 'Test Source' },
      category: i % 2 === 0 ? 'technology' : 'science',
      tags: [`tag${i + 1}`, 'test'],
      publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Different dates
      fetchedAt: new Date(),
      meta: { wordCount: 100 + i * 50, readingTime: 1 + i }
    }));

    return await Article.insertMany(articles);
  },

  /**
   * Generate auth token for testing
   */
  generateAuthToken: (userId) => {
    const { generateToken } = require('../src/middleware/auth.js');
    return generateToken(userId);
  },

  /**
   * Wait for a specified amount of time
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Clean up test data
   */
  cleanup: async () => {
    const User = (await import('../src/models/User.js')).default;
    const Article = (await import('../src/models/Article.js')).default;
    const SavedArticle = (await import('../src/models/SavedArticle.js')).default;
    const AnalyticsEvent = (await import('../src/models/Analytics.js')).default;

    await Promise.all([
      User.deleteMany({}),
      Article.deleteMany({}),
      SavedArticle.deleteMany({}),
      AnalyticsEvent.deleteMany({})
    ]);
  }
};

// Export for use in tests
export default testUtils;
