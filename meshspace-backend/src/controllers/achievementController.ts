import { Request, Response } from 'express';
import { AchievementService } from '../services/achievementService';
import { logger } from '../middleware/logging';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// Get user's achievements
export const getUserAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await AchievementService.getUserAchievements(
      userId,
      Number(page),
      Number(limit)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's achievement points
export const getUserPoints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const points = await AchievementService.getUserPoints(userId);

    res.json({ points });
  } catch (error) {
    logger.error('Error getting user points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await AchievementService.getLeaderboard(Number(limit));

    res.json(leaderboard);
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check achievements for current user
export const checkAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    await AchievementService.checkAchievements(userId);

    res.json({ message: 'Achievements checked successfully' });
  } catch (error) {
    logger.error('Error checking achievements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Initialize default achievements (admin only)
export const initializeAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    await AchievementService.initializeDefaultAchievements();

    res.json({ message: 'Default achievements initialized successfully' });
  } catch (error) {
    logger.error('Error initializing achievements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
