import { Request, Response, RequestHandler } from 'express';
import Post from '../models/Post';
import user from '../routes/user';
import { createNotification } from './notificationController';
import User from '../models/User';
import Comments from '../models/Comments';
import { Types } from 'mongoose';

export const createPost: RequestHandler = async (req, res) => {
  const { content } = req.body;
  // Fix: Add type to req to include 'file' property
  const file = (req as any).file;
  const imageUrl = (file && typeof file === 'object' && 'path' in file) ? file.path : undefined;

  if (!content && !imageUrl) {
    res.status(400).json({ status: 'error', message: 'Content or image is required' });
    return;
  }
  try {
    const post = await Post.create({
      author: req.user && req.user.userId ? req.user.userId : undefined,
      content: content,
      imageUrl: imageUrl,
    });
    res.status(201).json({ status: 'success', message: 'Post created', data: post });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const fetchFeed: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const type = (req.query.type as string) || 'following';
    const userId = req.user!.userId;

    let posts;
    if (type === 'trending') {
      // Trending: posts with most likes+reposts in last 24h
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      posts = await Post.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ['$likes', []] } },
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'repost',
            as: 'reposts',
          },
        },
        {
          $addFields: {
            repostCount: { $size: '$reposts' },
            trendingScore: { $add: ['$likesCount', { $size: '$reposts' }] },
            trending: true
          },
        },
        { $sort: { trendingScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      // Populate author and repost fields manually after aggregation
      posts = await Post.populate(posts, [
        { path: 'author', select: 'username avatar following' },
        { path: 'repost', select: 'author content imageUrl createdAt', populate: { path: 'author', select: 'username avatar' } }
      ]);
      // Add isFollowing and commentCount
      for (const post of posts) {
        const author = (post as any).author;
        (post as any).isFollowing = false;
        if (author && author._id && author.following) {
          (post as any).isFollowing = author.following.includes(userId);
        }
        (post as any).commentCount = await Comments.countDocuments({ post: post._id });
      }
    } else {
      // Following: posts from followed users and self
      const user = await User.findById(userId);
      const followingIds = user ? user.following.map(id => id.toString()) : [];
      followingIds.push(userId); // include self
      posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
        .populate('author', 'username avatar following')
        .populate({ path: 'repost', select: 'author content imageUrl createdAt', populate: { path: 'author', select: 'username avatar' } })
        .lean();
      // Add repostCount, likesCount, isFollowing, commentCount to each post
      for (const post of posts) {
        (post as any).likesCount = post.likes ? post.likes.length : 0;
        (post as any).repostCount = await Post.countDocuments({ repost: post._id });
        (post as any).trending = false;
        // isFollowing logic
        const author = (post as any).author;
        (post as any).isFollowing = false;
        if (author && author._id && author.followers) {
          (post as any).isFollowing = author.followers.some((id: any) => id.toString() === userId.toString());
        }
        (post as any).commentCount = await Comments.countDocuments({ post: post._id });
      }
    }
    res.json({ status: 'success', message: 'Feed fetched', data: posts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const toggleLike: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const alreadyLiked = post.likes.includes(userObjectId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id: any) => !id.equals(userObjectId));
    } else {
      post.likes.push(userObjectId);
    }
    await post.save();
    res.json({ status: 'success', message: alreadyLiked ? 'Like removed' : 'Post liked' });
    await createNotification({
      recipient: post.author.toString(),
      sender: userId,
      type: 'like',
      post: postId,
      message: `${user.username} liked your post`
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const addComment: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, parentComment } = req.body;
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const comment = await Comments.create({ post: postId, author: userId, text, parentComment: parentComment || null });
    res.status(201).json({ status: 'success', data: comment });
    // Notify post author (unless self)
    if (post.author.toString() !== userId) {
      await createNotification({
        recipient: post.author.toString(),
        sender: userId,
        type: 'comment',
        post: postId,
        message: `${user.username} commented on your post`
      });
    }
    // Notify parent comment author if this is a reply (and not self or post author)
    if (parentComment) {
      const parent = await Comments.findById(parentComment).populate('author', 'username');
      if (parent && parent.author && parent.author._id.toString() !== userId && parent.author._id.toString() !== post.author.toString()) {
        await createNotification({
          recipient: parent.author._id.toString(),
          sender: userId,
          type: 'reply',
          post: postId,
          message: `${user.username} replied to your comment`
        });
      }
    }
    // Mention notifications
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentionedUsernames: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentionedUsernames.push(match[1]);
    }
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });
      for (const mentioned of mentionedUsers) {
        const mentionedId = (mentioned as any)._id.toString();
        if (
          mentionedId !== userId &&
          mentionedId !== post.author.toString() &&
          (!parentComment || mentionedId !== (await Comments.findById(parentComment))?.author.toString())
        ) {
          await createNotification({
            recipient: mentionedId,
            sender: userId,
            type: 'mention',
            post: postId,
            message: `${user.username} mentioned you in a comment`
          });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

// Helper to build nested comments
async function buildCommentTree(comments: any[], parentId: string | null = null): Promise<any[]> {
  const nodes = comments.filter(comment => (comment.parentComment ? comment.parentComment.toString() : null) === (parentId ? parentId.toString() : null));
  const result = [];
  for (const comment of nodes) {
    const replies = await buildCommentTree(comments, comment._id);
    result.push({
      ...comment.toObject(),
      replies
    });
  }
  return result;
}

export const getComments: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comments.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username email avatar');
    const nestedComments = await buildCommentTree(comments);
    res.json({ status: 'success', data: nestedComments });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const repostPost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { quote } = req.body;
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    const originalPost = await Post.findById(postId).populate('author', 'username');
    if (!originalPost) {
      res.status(404).json({ message: 'Original post not found' });
      return;
    }
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    // Prevent duplicate reposts by the same user
    const existingRepost = await Post.findOne({ author: userId, repost: postId });
    if (existingRepost) {
      res.status(400).json({ message: 'You have already reposted this post' });
      return;
    }
    const repost = await Post.create({
      author: userId,
      content: quote || '',
      repost: postId,
    });
    res.status(201).json({ status: 'success', message: 'Reposted successfully', data: repost });
    // Notify original post author (unless self)
    if (originalPost.author._id.toString() !== userId) {
      await createNotification({
        recipient: originalPost.author._id.toString(),
        sender: userId,
        type: 'repost',
        post: postId,
        message: `${user.username} reposted your post`
      });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const getPostsByUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .populate({ path: 'repost', select: 'author content imageUrl createdAt', populate: { path: 'author', select: 'username' } })
      .lean();
    for (const post of posts) {
      (post as any).likesCount = post.likes ? post.likes.length : 0;
      (post as any).repostCount = await Post.countDocuments({ repost: post._id });
      (post as any).trending = false;
    }
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const getPostById: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate('author', 'username')
      .populate({ path: 'repost', select: 'author content imageUrl createdAt', populate: { path: 'author', select: 'username' } })
      .lean();
    if (!post) {
      res.status(404).json({ status: 'error', message: 'Post not found' });
      return;
    }
    (post as any).likesCount = post.likes ? post.likes.length : 0;
    (post as any).repostCount = await Post.countDocuments({ repost: post._id });
    res.json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', errors: [err instanceof Error ? err.message : String(err)] });
  }
};

export const search: RequestHandler = async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim();
    if (!q) {
      res.status(400).json({ users: [], posts: [] });
      return;
    }
    // Fuzzy, case-insensitive search for users
    const userQuery = {
      username: { $regex: q, $options: 'i' }
    };
    const users = await User.find(userQuery).select('_id username avatar').limit(10);

    // Fuzzy, case-insensitive search for posts (content or author username)
    // First, find user IDs matching the query (for author search)
    const matchingUsers = await User.find(userQuery).select('_id');
    const matchingUserIds = matchingUsers.map(u => u._id);
    const postQuery = {
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { author: { $in: matchingUserIds.length ? matchingUserIds : [Types.ObjectId.createFromTime(0)] } }
      ]
    };
    const posts = await Post.find(postQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username avatar')
      .populate({ path: 'repost', select: 'author content imageUrl createdAt', populate: { path: 'author', select: 'username avatar' } });

    res.json({ users, posts });
  } catch (err) {
    res.status(500).json({ users: [], posts: [], error: err instanceof Error ? err.message : String(err) });
  }
};
