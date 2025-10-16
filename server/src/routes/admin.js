/**
 * Admin Routes for Personalized News Aggregator
 * Administrative operations and system management
 */

import express from 'express';
import {
  getHealth,
  getMetrics,
  runFetchJob,
  runCleanupJob,
  runAnalyticsJob,
  getJobStatus,
  startJobs,
  stopJobs,
  clearCache,
  getCacheStats,
  removeDuplicates,
  getNewsSources,
  getNewsCategories,
  getUsers,
  updateUser,
  deleteUser,
  getSystemConfig,
  updateSystemConfig
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validation.js';
import { validateParams } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// System health and monitoring
router.get('/health', getHealth);
router.get('/metrics', getMetrics);
router.get('/jobs/status', getJobStatus);
router.get('/cache/stats', getCacheStats);
router.get('/system/config', getSystemConfig);

// Job management
router.post('/jobs/start', startJobs);
router.post('/jobs/stop', stopJobs);
router.post('/jobs/fetch', validateAdmin.systemConfig, runFetchJob);
router.post('/jobs/cleanup', runCleanupJob);
router.post('/jobs/analytics', runAnalyticsJob);

// Cache management
router.delete('/cache', clearCache);

// Data management
router.delete('/duplicates', removeDuplicates);

// News API information
router.get('/sources', getNewsSources);
router.get('/categories', getNewsCategories);

// User management
router.get('/users', getUsers);
router.put('/users/:id', validateParams.mongoId, validateAdmin.userUpdate, updateUser);
router.delete('/users/:id', validateParams.mongoId, deleteUser);

// System configuration
router.put('/system/config', validateAdmin.systemConfig, updateSystemConfig);

export default router;
