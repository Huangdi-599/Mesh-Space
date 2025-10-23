// src/routes/user.ts
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getMe,updateProfile, followUser,getFollowers,getFollowing, getUserByIdController, searchUsers} from '../controllers/userController';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.get('/search', authenticateToken, searchUsers);

router.put('/me', authenticateToken, upload.single('avatar'), updateProfile);

router.get('/:id', authenticateToken, getUserByIdController);
router.post('/:userId/follow', authenticateToken, followUser);
router.get('/:userId/followers', authenticateToken, getFollowers);
router.get('/:userId/following', authenticateToken, getFollowing);
export default router;