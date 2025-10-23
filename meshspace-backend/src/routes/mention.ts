import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getUserMentions, markMentionsAsRead, getUnreadMentionCount } from '../controllers/mentionController';

const router = express.Router();

// Get user mentions
router.get('/', authenticateToken, getUserMentions);

// Mark mentions as read
router.put('/mark-read', authenticateToken, markMentionsAsRead);

// Get unread mention count
router.get('/unread-count', authenticateToken, getUnreadMentionCount);

export default router;
