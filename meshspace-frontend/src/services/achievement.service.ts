import { api } from './api';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'content' | 'engagement' | 'milestone' | 'special';
  requirements: {
    type: 'posts' | 'likes_received' | 'likes_given' | 'comments' | 'followers' | 'days_active' | 'streak' | 'custom';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  _id: string;
  user: string;
  achievement: Achievement;
  earnedAt: string;
  points: number;
  isNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  totalPoints: number;
  achievementCount: number;
}

// Get user's achievements
export const getUserAchievements = async (userId: string, page = 1, limit = 20): Promise<{
  achievements: UserAchievement[];
  totalPages: number;
  currentPage: number;
  total: number;
}> => {
  const response = await api.get(`/achievements/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get user's achievement points
export const getUserPoints = async (userId: string): Promise<{ points: number }> => {
  const response = await api.get(`/achievements/user/${userId}/points`);
  return response.data;
};

// Get leaderboard
export const getLeaderboard = async (limit = 10): Promise<LeaderboardEntry[]> => {
  const response = await api.get(`/achievements/leaderboard?limit=${limit}`);
  return response.data;
};

// Check achievements for current user
export const checkAchievements = async (): Promise<{ message: string }> => {
  const response = await api.post('/achievements/check');
  return response.data;
};

// Initialize default achievements
export const initializeAchievements = async (): Promise<{ message: string }> => {
  const response = await api.post('/achievements/initialize');
  return response.data;
};
