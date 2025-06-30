// src/routes/user.ts
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getMe,updateProfile, followUser,getFollowers,getFollowing, getUserByIdController} from '../controllers/userController';

const router = express.Router();

router.get('/me', authenticateToken, getMe);

router.put('/me', authenticateToken, updateProfile);

router.get('/:id', authenticateToken, getUserByIdController);
router.post('/:userId/follow', authenticateToken, followUser);
router.get('/:userId/followers', authenticateToken, getFollowers);
router.get('/:userId/following', authenticateToken, getFollowing);
export default router;