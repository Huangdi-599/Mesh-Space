import Hashtag from '../models/Hashtag';
import Post from '../models/Post';
import { logger } from '../middleware/logging';

export class TrendingService {
  // Extract hashtags from text content
  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const matches = text.match(hashtagRegex);
    
    if (!matches) return [];
    
    return matches
      .map(tag => tag.toLowerCase().replace('#', ''))
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
  }

  // Update hashtag statistics when a post is created
  static async updateHashtagStats(postId: string, content: string): Promise<void> {
    try {
      const hashtags = this.extractHashtags(content);
      
      for (const hashtagName of hashtags) {
        await Hashtag.findOneAndUpdate(
          { name: hashtagName },
          {
            $inc: { postCount: 1 },
            $set: { lastUsed: new Date() }
          },
          { upsert: true, new: true }
        );
      }

      // Update trending scores for all hashtags
      await this.calculateTrendingScores();
      
      logger.info(`Updated hashtag stats for post ${postId}: ${hashtags.length} hashtags`);
    } catch (error) {
      logger.error('Error updating hashtag stats:', error);
      throw error;
    }
  }

  // Calculate trending scores based on time-decay and engagement
  static async calculateTrendingScores(): Promise<void> {
    try {
      const hashtags = await Hashtag.find({});
      const now = new Date();
      
      for (const hashtag of hashtags) {
        // Time decay factor (newer hashtags get higher scores)
        const hoursSinceLastUsed = (now.getTime() - hashtag.lastUsed.getTime()) / (1000 * 60 * 60);
        const timeDecayFactor = Math.exp(-hoursSinceLastUsed / 24); // 24-hour half-life
        
        // Engagement factor (posts with more engagement get higher scores)
        const posts = await Post.find({
          content: { $regex: `#${hashtag.name}`, $options: 'i' }
        }).select('likes reactions createdAt');
        
        let engagementScore = 0;
        for (const post of posts) {
          const likes = post.likes?.length || 0;
          const reactions = post.reactions?.length || 0;
          const totalEngagement = likes + reactions;
          
          // Recent posts get more weight
          const postAge = (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60);
          const postWeight = Math.exp(-postAge / 12); // 12-hour half-life for posts
          
          engagementScore += totalEngagement * postWeight;
        }
        
        // Calculate final trending score
        const trendingScore = (hashtag.postCount * 0.3) + (engagementScore * 0.7) * timeDecayFactor;
        
        await Hashtag.findByIdAndUpdate(hashtag._id, {
          trendingScore: Math.round(trendingScore * 100) / 100
        });
      }
      
      logger.info('Trending scores calculated successfully');
    } catch (error) {
      logger.error('Error calculating trending scores:', error);
      throw error;
    }
  }

  // Get trending hashtags
  static async getTrendingHashtags(limit = 10): Promise<any[]> {
    try {
      const hashtags = await Hashtag.find({})
        .sort({ trendingScore: -1, postCount: -1 })
        .limit(limit)
        .select('name postCount trendingScore lastUsed');

      return hashtags;
    } catch (error) {
      logger.error('Error getting trending hashtags:', error);
      throw error;
    }
  }

  // Get hashtag details
  static async getHashtagDetails(hashtagName: string): Promise<any> {
    try {
      const hashtag = await Hashtag.findOne({ name: hashtagName.toLowerCase() });
      
      if (!hashtag) {
        return null;
      }

      // Get recent posts with this hashtag
      const posts = await Post.find({
        content: { $regex: `#${hashtagName}`, $options: 'i' }
      })
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(20);

      return {
        hashtag,
        recentPosts: posts
      };
    } catch (error) {
      logger.error('Error getting hashtag details:', error);
      throw error;
    }
  }

  // Search hashtags
  static async searchHashtags(query: string, limit = 10): Promise<any[]> {
    try {
      const hashtags = await Hashtag.find({
        name: { $regex: query.toLowerCase(), $options: 'i' }
      })
        .sort({ trendingScore: -1, postCount: -1 })
        .limit(limit)
        .select('name postCount trendingScore');

      return hashtags;
    } catch (error) {
      logger.error('Error searching hashtags:', error);
      throw error;
    }
  }

  // Get posts by hashtag
  static async getPostsByHashtag(hashtagName: string, page = 1, limit = 20): Promise<{
    posts: any[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    try {
      const posts = await Post.find({
        content: { $regex: `#${hashtagName}`, $options: 'i' }
      })
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Post.countDocuments({
        content: { $regex: `#${hashtagName}`, $options: 'i' }
      });

      return {
        posts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      logger.error('Error getting posts by hashtag:', error);
      throw error;
    }
  }

  // Clean up old hashtags (remove hashtags with 0 posts older than 30 days)
  static async cleanupOldHashtags(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Hashtag.deleteMany({
        postCount: 0,
        lastUsed: { $lt: thirtyDaysAgo }
      });

      logger.info('Old hashtags cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up old hashtags:', error);
      throw error;
    }
  }
}
