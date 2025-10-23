import { Request, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import { logger } from '../middleware/logging';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// Save a post to bookmarks
export const savePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if user has already saved this post
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.savedPosts.includes(postId as any)) {
      res.status(400).json({ message: 'Post already saved' });
      return;
    }

    // Add post to saved posts
    user.savedPosts.push(postId as any);
    await user.save();

    logger.info(`Post ${postId} saved by user ${userId}`);
    res.json({ 
      message: 'Post saved successfully',
      savedCount: user.savedPosts.length
    });
  } catch (error) {
    logger.error('Error saving post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a post from bookmarks
export const unsavePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Remove post from saved posts
    user.savedPosts = user.savedPosts.filter(
      (savedPostId: any) => savedPostId.toString() !== postId
    );
    await user.save();

    logger.info(`Post ${postId} unsaved by user ${userId}`);
    res.json({ 
      message: 'Post removed from saved posts',
      savedCount: user.savedPosts.length
    });
  } catch (error) {
    logger.error('Error unsaving post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's saved posts
export const getSavedPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'author',
        select: 'username avatar'
      },
      options: {
        sort: { createdAt: -1 },
        limit: Number(limit) * 1,
        skip: (Number(page) - 1) * Number(limit)
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get total count for pagination
    const total = user.savedPosts.length;

    res.json({
      posts: user.savedPosts,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    logger.error('Error getting saved posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if a post is saved by the user
export const isPostSaved = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isSaved = user.savedPosts.includes(postId as any);

    res.json({ isSaved });
  } catch (error) {
    logger.error('Error checking if post is saved:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get saved posts count for a user
export const getSavedPostsCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ 
      savedCount: user.savedPosts.length 
    });
  } catch (error) {
    logger.error('Error getting saved posts count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
