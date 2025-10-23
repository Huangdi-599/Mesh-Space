import { Request, Response } from 'express';
import { TrendingService } from '../services/trendingService';
import { logger } from '../middleware/logging';

// Get trending hashtags
export const getTrendingHashtags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const hashtags = await TrendingService.getTrendingHashtags(Number(limit));
    
    res.json({
      status: 'success',
      data: hashtags
    });
  } catch (error) {
    logger.error('Error getting trending hashtags:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get trending hashtags' 
    });
  }
};

// Get hashtag details
export const getHashtagDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hashtag } = req.params;
    
    const details = await TrendingService.getHashtagDetails(hashtag);
    
    if (!details) {
      res.status(404).json({ 
        status: 'error', 
        message: 'Hashtag not found' 
      });
      return;
    }
    
    res.json({
      status: 'success',
      data: details
    });
  } catch (error) {
    logger.error('Error getting hashtag details:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get hashtag details' 
    });
  }
};

// Search hashtags
export const searchHashtags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({ 
        status: 'error', 
        message: 'Search query is required' 
      });
      return;
    }
    
    const hashtags = await TrendingService.searchHashtags(q, Number(limit));
    
    res.json({
      status: 'success',
      data: hashtags
    });
  } catch (error) {
    logger.error('Error searching hashtags:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to search hashtags' 
    });
  }
};

// Get posts by hashtag
export const getPostsByHashtag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await TrendingService.getPostsByHashtag(
      hashtag, 
      Number(page), 
      Number(limit)
    );
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Error getting posts by hashtag:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get posts by hashtag' 
    });
  }
};

// Calculate trending scores (admin endpoint)
export const calculateTrendingScores = async (req: Request, res: Response): Promise<void> => {
  try {
    await TrendingService.calculateTrendingScores();
    
    res.json({
      status: 'success',
      message: 'Trending scores calculated successfully'
    });
  } catch (error) {
    logger.error('Error calculating trending scores:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to calculate trending scores' 
    });
  }
};

// Clean up old hashtags (admin endpoint)
export const cleanupHashtags = async (req: Request, res: Response): Promise<void> => {
  try {
    await TrendingService.cleanupOldHashtags();
    
    res.json({
      status: 'success',
      message: 'Old hashtags cleaned up successfully'
    });
  } catch (error) {
    logger.error('Error cleaning up hashtags:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to clean up hashtags' 
    });
  }
};
