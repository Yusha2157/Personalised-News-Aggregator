/**
 * Authentication Integration Tests
 * Integration tests for authentication endpoints using in-memory MongoDB
 */

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { connectToDatabase } from '../../src/config/db.js';
import User from '../../src/models/User.js';
import { generateToken } from '../../src/middleware/auth.js';

describe('Authentication Integration Tests', () => {
  let mongoServer;
  let testUser;

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
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
    });

    it('should return 400 for duplicate email', async () => {
      // Create existing user
      const existingUser = new User({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      });
      await existingUser.save();

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'test@example.com'
        // Missing password and name
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);
    });

    it('should lock account after multiple failed attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);
      }

      // Account should now be locked
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123' // Correct password
        })
        .expect(423); // Account locked
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken;

    beforeEach(async () => {
      // Create test user and generate refresh token
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();

      // Generate refresh token
      refreshToken = generateToken(testUser._id, '7d');
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should return 400 for missing refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();

      // Generate auth token
      authToken = generateToken(testUser._id);
    });

    it('should return user profile for authenticated user', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should return 401 for invalid token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();

      // Generate auth token
      authToken = generateToken(testUser._id);
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        preferences: {
          categories: ['technology'],
          language: 'en'
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.preferences.categories).toContain('technology');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should return 400 for invalid update data', async () => {
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let authToken;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();

      // Generate auth token
      authToken = generateToken(testUser._id);
    });

    it('should change password with valid current password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should return 400 for incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);
    });

    it('should return 400 for weak new password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: '123'
      };

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      // Create test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();

      // Generate auth token
      authToken = generateToken(testUser._id);
    });

    it('should logout authenticated user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple requests quickly
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
