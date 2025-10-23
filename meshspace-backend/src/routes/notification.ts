import express from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { notificationLimiter } from '../middleware/security';

const router = express.Router();

// Apply notification-specific rate limiting
router.use(notificationLimiter);

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markNotificationAsRead);

export default router;