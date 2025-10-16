/**
 * Live News Routes
 * API endpoints for real-time news from multiple sources
 */

import express from 'express';
import {
  getLiveNews,
  getAvailableSources,
  healthCheck,
  getLiveNewsByCategory,
  searchLiveNews
} from '../controllers/liveNewsController.js';

const router = express.Router();

// Public routes (no authentication required for demo purposes)
// In production, you might want to add rate limiting or authentication

/**
 * @route GET /api/live-news
 * @desc Get live news from all sources
 * @access Public
 * @query {string} category - News category (general, technology, business, etc.)
 * @query {string} query - Search query
 * @query {number} limit - Maximum number of articles (default: 50)
 * @query {boolean} useCache - Whether to use cached results (default: true)
 */
router.get('/', getLiveNews);

/**
 * @route GET /api/live-news/category/:category
 * @desc Get live news by specific category
 * @access Public
 * @param {string} category - News category
 * @query {number} limit - Maximum number of articles (default: 20)
 * @query {boolean} useCache - Whether to use cached results (default: true)
 */
router.get('/category/:category', getLiveNewsByCategory);

/**
 * @route GET /api/live-news/search
 * @desc Search live news across all sources
 * @access Public
 * @query {string} q - Search query (required)
 * @query {string} category - Filter by category (optional)
 * @query {number} limit - Maximum number of articles (default: 20)
 */
router.get('/search', searchLiveNews);

/**
 * @route GET /api/live-news/sources
 * @desc Get list of available news sources
 * @access Public
 */
router.get('/sources', getAvailableSources);

/**
 * @route GET /api/live-news/health
 * @desc Health check for all news services
 * @access Public
 */
router.get('/health', healthCheck);

export default router;
