/**
 * Live News Controller
 * Handles requests for real-time news from multiple APIs
 */

import { catchAsync } from '../middleware/errorHandler.js';
import { liveNewsService } from '../services/liveNewsService.js';
import { logger } from '../config/logger.js';

/**
 * Get live news from all sources
 */
export const getLiveNews = catchAsync(async (req, res) => {
  const {
    category = 'general',
    query = '',
    limit = 50,
    useCache = true
  } = req.query;

  logger.info('Live news request', { 
    category, 
    query, 
    limit: parseInt(limit), 
    useCache: useCache === 'true',
    user: req.user?.email || 'anonymous'
  });

  try {
    const result = await liveNewsService.fetchLiveNews({
      category,
      query,
      limit: parseInt(limit),
      useCache: useCache === 'true'
    });

    res.json({
      success: true,
      data: result,
      message: 'Live news fetched successfully'
    });

  } catch (error) {
    logger.error('Live news fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live news',
      error: error.message
    });
  }
});

/**
 * Get available news sources
 */
export const getAvailableSources = catchAsync(async (req, res) => {
  try {
    const sources = liveNewsService.getAvailableSources();
    
    res.json({
      success: true,
      data: sources,
      message: 'Available sources retrieved successfully'
    });

  } catch (error) {
    logger.error('Sources fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available sources',
      error: error.message
    });
  }
});

/**
 * Health check for all news services
 */
export const healthCheck = catchAsync(async (req, res) => {
  try {
    const healthStatus = await liveNewsService.healthCheck();
    
    const healthyServices = Object.values(healthStatus).filter(
      status => status.status === 'healthy'
    ).length;
    
    const totalServices = Object.keys(healthStatus).length;
    
    res.json({
      success: true,
      data: {
        services: healthStatus,
        summary: {
          total: totalServices,
          healthy: healthyServices,
          unhealthy: totalServices - healthyServices,
          status: healthyServices > 0 ? 'operational' : 'degraded'
        }
      },
      message: 'Health check completed'
    });

  } catch (error) {
    logger.error('Health check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * Get live news by category
 */
export const getLiveNewsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const { limit = 20, useCache = true } = req.query;

  const validCategories = [
    'general', 'technology', 'business', 'sports', 
    'entertainment', 'science', 'health', 'politics'
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      validCategories
    });
  }

  logger.info('Live news by category request', { 
    category, 
    limit: parseInt(limit),
    user: req.user?.email || 'anonymous'
  });

  try {
    const result = await liveNewsService.fetchLiveNews({
      category,
      limit: parseInt(limit),
      useCache: useCache === 'true'
    });

    res.json({
      success: true,
      data: result,
      message: `Live ${category} news fetched successfully`
    });

  } catch (error) {
    logger.error('Live news by category error:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${category} news`,
      error: error.message
    });
  }
});

/**
 * Search live news
 */
export const searchLiveNews = catchAsync(async (req, res) => {
  const { q: query, category = 'general', limit = 20 } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  logger.info('Live news search request', { 
    query, 
    category, 
    limit: parseInt(limit),
    user: req.user?.email || 'anonymous'
  });

  try {
    const result = await liveNewsService.fetchLiveNews({
      query: query.trim(),
      category,
      limit: parseInt(limit),
      useCache: true
    });

    res.json({
      success: true,
      data: result,
      message: `Search results for "${query}" retrieved successfully`
    });

  } catch (error) {
    logger.error('Live news search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search live news',
      error: error.message
    });
  }
});
