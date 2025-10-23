import Achievement from '../models/Achievement';
import UserAchievement from '../models/UserAchievement';
import User from '../models/User';
import Post from '../models/Post';
import { logger } from '../middleware/logging';

interface UserStats {
  posts: number;
  likesReceived: number;
  likesGiven: number;
  comments: number;
  followers: number;
  daysActive: number;
  currentStreak: number;
}

export class AchievementService {
  // Get user statistics for achievement checking
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get posts count
      const postsCount = await Post.countDocuments({ author: userId });

      // Get likes received (from posts)
      const posts = await Post.find({ author: userId }).select('reactions');
      const likesReceived = posts.reduce((total, post) => {
        return total + (post.reactions?.length || 0);
      }, 0);

      // Get likes given (from user's reactions)
      const likesGiven = await Post.aggregate([
        { $match: { 'reactions.user': userId } },
        { $count: 'total' }
      ]);
      const likesGivenCount = likesGiven[0]?.total || 0;

      // Get comments count
      const commentsCount = await Post.aggregate([
        { $match: { author: userId } },
        { $unwind: '$comments' },
        { $count: 'total' }
      ]);
      const comments = commentsCount[0]?.total || 0;

      // Get followers count
      const followersCount = user.followers?.length || 0;

      // Calculate days active (simplified - based on account creation)
      const daysActive = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate current streak (simplified - based on recent posts)
      const recentPosts = await Post.find({
        author: userId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }).sort({ createdAt: -1 });

      let currentStreak = 0;
      let lastPostDate = new Date();
      
      for (const post of recentPosts) {
        const postDate = new Date(post.createdAt);
        const daysDiff = Math.floor((lastPostDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          currentStreak++;
          lastPostDate = postDate;
        } else {
          break;
        }
      }

      return {
        posts: postsCount,
        likesReceived,
        likesGiven: likesGivenCount,
        comments,
        followers: followersCount,
        daysActive,
        currentStreak
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Check and award achievements for a user
  static async checkAchievements(userId: string): Promise<void> {
    try {
      const userStats = await this.getUserStats(userId);
      const activeAchievements = await Achievement.find({ isActive: true });
      
      for (const achievement of activeAchievements) {
        // Check if user already has this achievement
        const existingAchievement = await UserAchievement.findOne({
          user: userId,
          achievement: achievement._id
        });

        if (existingAchievement) {
          continue; // User already has this achievement
        }

        // Check if user meets the requirements
        const meetsRequirements = await this.checkRequirement(achievement, userStats);
        
        if (meetsRequirements) {
          // Award the achievement
          await UserAchievement.create({
            user: userId,
            achievement: achievement._id,
            points: achievement.points
          });

          logger.info(`Achievement awarded: ${achievement.name} to user ${userId}`);
        }
      }
    } catch (error) {
      logger.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Check if user meets achievement requirements
  private static async checkRequirement(achievement: any, userStats: UserStats): Promise<boolean> {
    const { type, value, timeframe } = achievement.requirements;

    switch (type) {
      case 'posts':
        return userStats.posts >= value;
      
      case 'likes_received':
        return userStats.likesReceived >= value;
      
      case 'likes_given':
        return userStats.likesGiven >= value;
      
      case 'comments':
        return userStats.comments >= value;
      
      case 'followers':
        return userStats.followers >= value;
      
      case 'days_active':
        return userStats.daysActive >= value;
      
      case 'streak':
        return userStats.currentStreak >= value;
      
      default:
        return false;
    }
  }

  // Get user's achievements
  static async getUserAchievements(userId: string, page = 1, limit = 20) {
    try {
      const achievements = await UserAchievement.find({ user: userId })
        .populate('achievement')
        .sort({ earnedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await UserAchievement.countDocuments({ user: userId });

      return {
        achievements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      logger.error('Error getting user achievements:', error);
      throw error;
    }
  }

  // Get user's achievement points
  static async getUserPoints(userId: string): Promise<number> {
    try {
      const result = await UserAchievement.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalPoints: { $sum: '$points' } } }
      ]);

      return result[0]?.totalPoints || 0;
    } catch (error) {
      logger.error('Error getting user points:', error);
      throw error;
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await UserAchievement.aggregate([
        {
          $group: {
            _id: '$user',
            totalPoints: { $sum: '$points' },
            achievementCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user: {
              _id: '$user._id',
              username: '$user.username',
              profilePicture: '$user.profilePicture'
            },
            totalPoints: 1,
            achievementCount: 1
          }
        },
        {
          $sort: { totalPoints: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return leaderboard;
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Initialize default achievements
  static async initializeDefaultAchievements(): Promise<void> {
    try {
      const defaultAchievements = [
        {
          name: 'First Post',
          description: 'Create your first post',
          icon: 'mdi:post',
          category: 'content',
          requirements: { type: 'posts', value: 1 },
          points: 10,
          rarity: 'common'
        },
        {
          name: 'Getting Started',
          description: 'Create 5 posts',
          icon: 'mdi:post-outline',
          category: 'content',
          requirements: { type: 'posts', value: 5 },
          points: 25,
          rarity: 'common'
        },
        {
          name: 'Content Creator',
          description: 'Create 25 posts',
          icon: 'mdi:post-plus',
          category: 'content',
          requirements: { type: 'posts', value: 25 },
          points: 100,
          rarity: 'uncommon'
        },
        {
          name: 'Popular Writer',
          description: 'Create 100 posts',
          icon: 'mdi:post-star',
          category: 'content',
          requirements: { type: 'posts', value: 100 },
          points: 500,
          rarity: 'rare'
        },
        {
          name: 'First Like',
          description: 'Receive your first like',
          icon: 'mdi:heart',
          category: 'engagement',
          requirements: { type: 'likes_received', value: 1 },
          points: 5,
          rarity: 'common'
        },
        {
          name: 'Liked',
          description: 'Receive 10 likes',
          icon: 'mdi:heart-multiple',
          category: 'engagement',
          requirements: { type: 'likes_received', value: 10 },
          points: 50,
          rarity: 'common'
        },
        {
          name: 'Popular',
          description: 'Receive 100 likes',
          icon: 'mdi:heart-star',
          category: 'engagement',
          requirements: { type: 'likes_received', value: 100 },
          points: 250,
          rarity: 'uncommon'
        },
        {
          name: 'Viral',
          description: 'Receive 1000 likes',
          icon: 'mdi:heart-flash',
          category: 'engagement',
          requirements: { type: 'likes_received', value: 1000 },
          points: 1000,
          rarity: 'legendary'
        },
        {
          name: 'Social Butterfly',
          description: 'Give 50 likes',
          icon: 'mdi:heart-outline',
          category: 'social',
          requirements: { type: 'likes_given', value: 50 },
          points: 100,
          rarity: 'uncommon'
        },
        {
          name: 'First Follower',
          description: 'Gain your first follower',
          icon: 'mdi:account-plus',
          category: 'social',
          requirements: { type: 'followers', value: 1 },
          points: 25,
          rarity: 'common'
        },
        {
          name: 'Growing Audience',
          description: 'Gain 10 followers',
          icon: 'mdi:account-group',
          category: 'social',
          requirements: { type: 'followers', value: 10 },
          points: 100,
          rarity: 'uncommon'
        },
        {
          name: 'Influencer',
          description: 'Gain 100 followers',
          icon: 'mdi:account-star',
          category: 'social',
          requirements: { type: 'followers', value: 100 },
          points: 500,
          rarity: 'rare'
        },
        {
          name: 'Streak Master',
          description: 'Post for 7 consecutive days',
          icon: 'mdi:fire',
          category: 'milestone',
          requirements: { type: 'streak', value: 7 },
          points: 200,
          rarity: 'epic'
        }
      ];

      for (const achievementData of defaultAchievements) {
        const existingAchievement = await Achievement.findOne({ name: achievementData.name });
        if (!existingAchievement) {
          await Achievement.create(achievementData);
          logger.info(`Created default achievement: ${achievementData.name}`);
        }
      }
    } catch (error) {
      logger.error('Error initializing default achievements:', error);
      throw error;
    }
  }
}
