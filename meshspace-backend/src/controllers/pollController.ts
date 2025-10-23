import { Request, Response } from 'express';
import Poll from '../models/Poll';
import Post from '../models/Post';
import { validationResult } from 'express-validator';
import { logger } from '../middleware/logging';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// Create a new poll
export const createPoll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { question, options, expiresAt, allowMultiple, postId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validate options
    if (!options || options.length < 2) {
      res.status(400).json({ message: 'Poll must have at least 2 options' });
      return;
    }

    if (options.length > 10) {
      res.status(400).json({ message: 'Poll cannot have more than 10 options' });
      return;
    }

    // Validate expiration date
    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      res.status(400).json({ message: 'Expiration date must be in the future' });
      return;
    }

    // If poll is linked to a post, verify the post exists and user owns it
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      if (post.author.toString() !== userId) {
        res.status(403).json({ message: 'You can only create polls for your own posts' });
        return;
      }
    }

    const poll = new Poll({
      question,
      options: options.map((option: string) => ({ text: option, votes: [] })),
      expiresAt: expirationDate,
      allowMultiple: allowMultiple || false,
      createdBy: userId,
      postId: postId || undefined
    });

    await poll.save();

    // Populate the created poll
    const populatedPoll = await Poll.findById(poll._id)
      .populate('createdBy', 'username profilePicture')
      .populate('options.votes', 'username profilePicture');

    logger.info(`Poll created: ${poll._id} by user: ${userId}`);
    res.status(201).json(populatedPoll);
  } catch (error) {
    logger.error('Error creating poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Vote on a poll
export const votePoll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { pollId } = req.params;
    const { optionIndexes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    // Check if poll is expired
    if (new Date() > poll.expiresAt) {
      res.status(400).json({ message: 'Poll has expired' });
      return;
    }

    // Validate option indexes
    if (!Array.isArray(optionIndexes) || optionIndexes.length === 0) {
      res.status(400).json({ message: 'At least one option must be selected' });
      return;
    }

    if (!poll.allowMultiple && optionIndexes.length > 1) {
      res.status(400).json({ message: 'This poll only allows single choice' });
      return;
    }

    // Validate option indexes are within bounds
    for (const index of optionIndexes) {
      if (index < 0 || index >= poll.options.length) {
        res.status(400).json({ message: 'Invalid option selected' });
        return;
      }
    }

    // Remove user's existing votes
    for (const option of poll.options) {
      option.votes = option.votes.filter(
        (voteId: any) => voteId.toString() !== userId
      );
    }

    // Add new votes
    for (const index of optionIndexes) {
      poll.options[index].votes.push(userId as any);
    }

    await poll.save();

    // Return updated poll
    const updatedPoll = await Poll.findById(poll._id)
      .populate('createdBy', 'username profilePicture')
      .populate('options.votes', 'username profilePicture');

    logger.info(`User ${userId} voted on poll ${pollId}`);
    res.json(updatedPoll);
  } catch (error) {
    logger.error('Error voting on poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get poll results
export const getPollResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId)
      .populate('createdBy', 'username profilePicture')
      .populate('options.votes', 'username profilePicture');

    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    // Calculate results
    const results = {
      ...poll.toObject(),
      totalVotes: poll.options.reduce((total, option) => total + option.votes.length, 0),
      isExpired: new Date() > poll.expiresAt
    };

    res.json(results);
  } catch (error) {
    logger.error('Error getting poll results:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get polls by user
export const getUserPolls = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const polls = await Poll.find({ createdBy: userId })
      .populate('createdBy', 'username profilePicture')
      .populate('options.votes', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Poll.countDocuments({ createdBy: userId });

    res.json({
      polls,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    logger.error('Error getting user polls:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete poll
export const deletePoll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { pollId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    if (poll.createdBy.toString() !== userId) {
      res.status(403).json({ message: 'You can only delete your own polls' });
      return;
    }

    await Poll.findByIdAndDelete(pollId);

    logger.info(`Poll deleted: ${pollId} by user: ${userId}`);
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    logger.error('Error deleting poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
