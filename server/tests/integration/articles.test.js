/**
 * Articles Integration Tests
 * Integration tests for article endpoints using in-memory MongoDB
 */

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { connectToDatabase } from '../../src/config/db.js';
import Article from '../../src/models/Article.js';
import User from '../../src/models/User.js';
import { generateToken } from '../../src/middleware/auth.js';

describe('Articles Integration Tests', () => {
  let mongoServer;
  let authToken;
  let adminToken;
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Override the database connection for testing
    process.env.MONGODB_URI = mongoUri;
    await connectToDatabase();
  });

  beforeEach(async () => {
    // Clear database
    await Article.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user'
    });
    await testUser.save();

    // Create test admin
    testAdmin = new User({
      email: 'admin@example.com',
      password: 'password123',
      name: 'Test Admin',
      role: 'admin'
    });
    await testAdmin.save();

    // Generate tokens
    authToken = generateToken(testUser._id);
    adminToken = generateToken(testAdmin._id);

    // Create test articles
    const testArticles = [
      {
        title: 'AI Revolution in Healthcare',
        description: 'Artificial intelligence is transforming healthcare with new diagnostic tools.',
        url: 'https://example.com/ai-healthcare',
        urlToImage: 'https://example.com/image1.jpg',
        source: { id: 'example', name: 'Example News' },
        category: 'technology',
        tags: ['ai', 'healthcare', 'technology'],
        publishedAt: new Date('2024-01-15'),
        fetchedAt: new Date(),
        meta: { wordCount: 500, readingTime: 3 }
      },
      {
        title: 'Climate Change Solutions',
        description: 'New technologies are helping combat climate change.',
        url: 'https://example.com/climate-solutions',
        urlToImage: 'https://example.com/image2.jpg',
        source: { id: 'example', name: 'Example News' },
        category: 'science',
        tags: ['climate', 'environment', 'technology'],
        publishedAt: new Date('2024-01-14'),
        fetchedAt: new Date(),
        meta: { wordCount: 400, readingTime: 2 }
      },
      {
        title: 'Space Exploration Update',
        description: 'Latest developments in space exploration missions.',
        url: 'https://example.com/space-update',
        urlToImage: 'https://example.com/image3.jpg',
        source: { id: 'space-news', name: 'Space News' },
        category: 'science',
        tags: ['space', 'exploration', 'nasa'],
        publishedAt: new Date('2024-01-13'),
        fetchedAt: new Date(),
        meta: { wordCount: 600, readingTime: 4 }
      }
    ];

    await Article.insertMany(testArticles);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/articles', () => {
    it('should return articles with default pagination', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.total).toBe(3);
    });

    it('should return articles with custom pagination', async () => {
      const response = await request(app)
        .get('/api/articles?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should filter articles by category', async () => {
      const response = await request(app)
        .get('/api/articles?category=technology')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('technology');
    });

    it('should filter articles by tags', async () => {
      const response = await request(app)
        .get('/api/articles?tags=ai,healthcare')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].tags).toContain('ai');
    });

    it('should search articles by text', async () => {
      const response = await request(app)
        .get('/api/articles?search=artificial intelligence')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('AI');
    });

    it('should sort articles by published date', async () => {
      const response = await request(app)
        .get('/api/articles?sortBy=publishedAt&sortOrder=asc')
        .expect(200);

      const dates = response.body.data.map(article => new Date(article.publishedAt));
      expect(dates[0]).toBeLessThanOrEqual(dates[1]);
      expect(dates[1]).toBeLessThanOrEqual(dates[2]);
    });

    it('should filter articles by date range', async () => {
      const response = await request(app)
        .get('/api/articles?dateFrom=2024-01-14&dateTo=2024-01-15')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(article => {
        const date = new Date(article.publishedAt);
        expect(date).toBeGreaterThanOrEqual(new Date('2024-01-14'));
        expect(date).toBeLessThanOrEqual(new Date('2024-01-15'));
      });
    });

    it('should return 400 for invalid query parameters', async () => {
      await request(app)
        .get('/api/articles?page=invalid')
        .expect(400);
    });

    it('should return 400 for invalid sortBy parameter', async () => {
      await request(app)
        .get('/api/articles?sortBy=invalidField')
        .expect(400);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return article by ID', async () => {
      const articles = await Article.find();
      const articleId = articles[0]._id;

      const response = await request(app)
        .get(`/api/articles/${articleId}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', articleId.toString());
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent article', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/articles/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid article ID', async () => {
      await request(app)
        .get('/api/articles/invalid-id')
        .expect(400);
    });
  });

  describe('POST /api/articles/fetch', () => {
    it('should trigger news fetch for admin user', async () => {
      const response = await request(app)
        .post('/api/articles/fetch')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categories: ['technology'],
          pageSize: 5
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('jobId');
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .post('/api/articles/fetch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categories: ['technology']
        })
        .expect(403);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .post('/api/articles/fetch')
        .send({
          categories: ['technology']
        })
        .expect(401);
    });

    it('should return 400 for invalid fetch parameters', async () => {
      await request(app)
        .post('/api/articles/fetch')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categories: ['invalid-category']
        })
        .expect(400);
    });
  });

  describe('GET /api/articles/trending', () => {
    it('should return trending articles', async () => {
      const response = await request(app)
        .get('/api/articles/trending')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('period');
      expect(response.body.data).toHaveLength(3);
    });

    it('should return trending articles with custom limit', async () => {
      const response = await request(app)
        .get('/api/articles/trending?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test the error response format
      const response = await request(app)
        .get('/api/articles/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance tests', () => {
    it('should handle large result sets efficiently', async () => {
      // Create many articles
      const manyArticles = Array.from({ length: 100 }, (_, i) => ({
        title: `Article ${i}`,
        description: `Description for article ${i}`,
        url: `https://example.com/article-${i}`,
        urlToImage: `https://example.com/image-${i}.jpg`,
        source: { id: 'example', name: 'Example News' },
        category: 'technology',
        tags: ['test'],
        publishedAt: new Date(),
        fetchedAt: new Date(),
        meta: { wordCount: 100, readingTime: 1 }
      }));

      await Article.insertMany(manyArticles);

      const start = Date.now();
      const response = await request(app)
        .get('/api/articles?limit=50')
        .expect(200);
      const duration = Date.now() - start;

      expect(response.body.data).toHaveLength(50);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
