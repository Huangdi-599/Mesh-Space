import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createPost, fetchFeed ,toggleLike,addComment, getComments, repostPost, getPostsByUser, getPostById, search } from '../controllers/postController';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', authenticateToken, upload.single('image'), createPost);
router.get('/feed', authenticateToken, fetchFeed);
router.post('/:postId/like', authenticateToken, toggleLike);
router.post('/:postId/comments', authenticateToken, addComment);
router.get('/:postId/comments', authenticateToken, getComments);
router.post('/:postId/repost', authenticateToken, repostPost);
router.get('/user/:userId', authenticateToken, getPostsByUser);
router.get('/:postId', authenticateToken, getPostById);
router.get('/search', search);

export default router;