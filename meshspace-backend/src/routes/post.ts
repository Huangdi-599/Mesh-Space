import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createPost, fetchFeed ,toggleLike,addComment, getComments, repostPost, getPostsByUser, getPostById, search, deletePost, updatePost, deleteComment, updateComment, addReaction, removeReaction } from '../controllers/postController';
import { upload } from '../middleware/upload';
import { postLimiter, commentLimiter } from '../middleware/security';

const router = express.Router();

// Apply rate limiting only to post creation
router.post('/', authenticateToken, postLimiter, upload.single('image'), createPost);
router.get('/feed', authenticateToken, fetchFeed);
router.get('/search', search);
router.post('/:postId/like', authenticateToken, toggleLike);
router.post('/:postId/react', authenticateToken, addReaction);
router.delete('/:postId/react', authenticateToken, removeReaction);
router.post('/:postId/comments', authenticateToken, commentLimiter, addComment);
router.get('/:postId/comments', authenticateToken, getComments);
router.post('/:postId/repost', authenticateToken, repostPost);
router.get('/user/:userId', authenticateToken, getPostsByUser);
router.get('/:postId', authenticateToken, getPostById);
router.put('/:postId', authenticateToken, upload.single('image'), updatePost);
router.delete('/:postId', authenticateToken, deletePost);
router.put('/comments/:commentId', authenticateToken, updateComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;