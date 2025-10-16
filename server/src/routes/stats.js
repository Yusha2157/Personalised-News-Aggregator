/**
 * Statistics Routes for Personalized News Aggregator
 * Analytics and trending data endpoints
 */

import express from 'express';
import {
  getTrending,
  getSystemAnalytics,
  getTrendingCategories,
  getTrendingTags,
  getTrendingSources,
  getTopSavedArticles,
  getUserActivity,
  getAnalyticsHealth,
  generateReport
} from '../controllers/statsController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateStats } from '../middleware/validation.js';

const router = express.Router();

// Public routes (trending data)
router.get('/trending', optionalAuth, validateStats.trending, getTrending);
router.get('/trending/categories', optionalAuth, validateStats.trending, getTrendingCategories);
router.get('/trending/tags', optionalAuth, validateStats.trending, getTrendingTags);
router.get('/trending/sources', optionalAuth, validateStats.trending, getTrendingSources);
router.get('/trending/articles', optionalAuth, validateStats.trending, getTopSavedArticles);

// Protected routes (detailed analytics)
router.get('/analytics', authenticateToken, validateStats.analytics, getSystemAnalytics);
router.get('/activity', authenticateToken, getUserActivity);
router.get('/health', authenticateToken, getAnalyticsHealth);
router.get('/report', authenticateToken, validateStats.analytics, generateReport);

export default router;
