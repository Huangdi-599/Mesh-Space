import express from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';
// Rate limiters removed for serverless deployment compatibility

const router = express.Router();

// Apply notification-specific rate limiting
// Rate limiting removed for serverless deployment compatibility

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markNotificationAsRead);

export default router;