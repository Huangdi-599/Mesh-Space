import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { generalLimiter } from '../middleware/security';
import {
  savePost,
  unsavePost,
  getSavedPosts,
  isPostSaved,
  getSavedPostsCount
} from '../controllers/bookmarkController';

const router = express.Router();

// Apply rate limiting to all bookmark routes
router.use(generalLimiter);

// Save a post
router.post('/:postId', authenticateToken, savePost);

// Remove a post from saved
router.delete('/:postId', authenticateToken, unsavePost);

// Get user's saved posts
router.get('/', authenticateToken, getSavedPosts);

// Check if a post is saved
router.get('/:postId/check', authenticateToken, isPostSaved);

// Get saved posts count
router.get('/count', authenticateToken, getSavedPostsCount);

export default router;
