import express from 'express';
import { generalLimiter } from '../middleware/security';
import {
  getTrendingHashtags,
  getHashtagDetails,
  searchHashtags,
  getPostsByHashtag,
  calculateTrendingScores,
  cleanupHashtags
} from '../controllers/hashtagController';

const router = express.Router();

// Apply rate limiting to all hashtag routes
router.use(generalLimiter);

// Get trending hashtags
router.get('/trending', getTrendingHashtags);

// Search hashtags
router.get('/search', searchHashtags);

// Get hashtag details
router.get('/:hashtag', getHashtagDetails);

// Get posts by hashtag
router.get('/:hashtag/posts', getPostsByHashtag);

// Admin endpoints
router.post('/admin/calculate-trending', calculateTrendingScores);
router.post('/admin/cleanup', cleanupHashtags);

export default router;
