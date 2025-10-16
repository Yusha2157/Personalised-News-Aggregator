import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  // Legacy functions
  me,
  updateInterests,
  stats
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateAuth } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, validateAuth.register, register);
router.post('/login', authRateLimiter, validateAuth.login, login);
router.post('/refresh-token', validateAuth.refreshToken, refreshToken);
router.post('/forgot-password', authRateLimiter, validateAuth.forgotPassword, forgotPassword);
router.post('/reset-password', validateAuth.resetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authRateLimiter, resendVerification);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateAuth.updateProfile, updateProfile);
router.put('/change-password', authenticateToken, validateAuth.changePassword, changePassword);

// Legacy routes for backward compatibility
router.get('/me', authenticateToken, me);
router.put('/interests', authenticateToken, updateInterests);
router.get('/stats', authenticateToken, stats);

export default router;


