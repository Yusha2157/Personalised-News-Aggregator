/**
 * Users Routes for Personalized News Aggregator
 * User-specific operations and saved articles management
 */

import express from 'express';
import {
  saveArticle,
  unsaveArticle,
  getSavedArticles,
  isArticleSaved,
  getPreferences,
  updatePreferences,
  getUserStats,
  getUserAnalytics,
  getRecommendations
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateUser, validateParams } from '../middleware/validation.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Saved articles management
router.post('/saved-articles', validateUser.save, saveArticle);
router.delete('/saved-articles/:articleId', validateParams.articleId, unsaveArticle);
router.get('/saved-articles', validateUser.savedArticles, getSavedArticles);
router.get('/saved-articles/:articleId', validateParams.articleId, isArticleSaved);

// User preferences
router.get('/preferences', getPreferences);
router.put('/preferences', validateUser.update, updatePreferences);

// User analytics and stats
router.get('/stats', getUserStats);
router.get('/analytics', getUserAnalytics);
router.get('/recommendations', getRecommendations);

export default router;
