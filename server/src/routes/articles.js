/**
 * Articles Routes for Personalized News Aggregator
 * Comprehensive article management endpoints
 */

import express from 'express';
import {
  fetchArticles,
  getArticles,
  getArticle,
  getTrendingArticles,
  searchArticles,
  getArticlesByCategory,
  getArticlesByTag,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleStats,
  shareArticle
} from '../controllers/articleController.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateArticle } from '../middleware/validation.js';
import { validateParams } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validateArticle.query, getArticles);
router.get('/trending', optionalAuth, getTrendingArticles);
router.get('/search', optionalAuth, searchArticles);
router.get('/category/:category', optionalAuth, validateArticle.query, getArticlesByCategory);
router.get('/tag/:tag', optionalAuth, validateArticle.query, getArticlesByTag);
router.get('/:id', optionalAuth, validateParams.mongoId, getArticle);
router.post('/:id/share', optionalAuth, validateParams.mongoId, shareArticle);
router.get('/:id/stats', optionalAuth, validateParams.mongoId, getArticleStats);

// Protected routes (admin only)
router.post('/fetch', authenticateToken, requireAdmin, validateArticle.fetch, fetchArticles);
router.post('/', authenticateToken, requireAdmin, validateArticle.create, createArticle);
router.put('/:id', authenticateToken, requireAdmin, validateParams.mongoId, validateArticle.update, updateArticle);
router.delete('/:id', authenticateToken, requireAdmin, validateParams.mongoId, deleteArticle);

export default router;
