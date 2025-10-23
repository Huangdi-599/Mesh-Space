import { Request, Response } from 'express';
import { MentionService } from '../services/mentionService';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getUserMentions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await MentionService.getUserMentions(userId, page, limit);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mentions',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const markMentionsAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const { mentionIds } = req.body;
    
    if (!Array.isArray(mentionIds)) {
      res.status(400).json({ status: 'error', message: 'mentionIds must be an array' });
      return;
    }

    await MentionService.markMentionsAsRead(userId, mentionIds);

    res.json({
      status: 'success',
      message: 'Mentions marked as read'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark mentions as read',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getUnreadMentionCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const count = await MentionService.getUnreadMentionCount(userId);

    res.json({
      status: 'success',
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get unread mention count',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
