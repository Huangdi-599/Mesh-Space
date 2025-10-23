import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
// Rate limiters removed for serverless deployment compatibility
import {
  getUserAchievements,
  getUserPoints,
  getLeaderboard,
  checkAchievements,
  initializeAchievements
} from '../controllers/achievementController';

const router = express.Router();

// Apply rate limiting to all achievement routes
// Rate limiting removed for serverless deployment compatibility

// Get user's achievements
router.get('/user/:userId', getUserAchievements);

// Get user's achievement points
router.get('/user/:userId/points', getUserPoints);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Check achievements for current user
router.post('/check', authenticateToken, checkAchievements);

// Initialize default achievements (admin endpoint)
router.post('/initialize', initializeAchievements);

export default router;
