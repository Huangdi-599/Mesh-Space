import { api } from './api';

export interface Hashtag {
  _id: string;
  name: string;
  postCount: number;
  trendingScore: number;
  lastUsed: string;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HashtagDetails {
  hashtag: Hashtag;
  recentPosts: any[];
}

export interface PostsByHashtag {
  posts: any[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Get trending hashtags
export const getTrendingHashtags = async (limit = 10): Promise<Hashtag[]> => {
  const response = await api.get(`/hashtags/trending?limit=${limit}`);
  return response.data.data;
};

// Get hashtag details
export const getHashtagDetails = async (hashtag: string): Promise<HashtagDetails> => {
  const response = await api.get(`/hashtags/${hashtag}`);
  return response.data.data;
};

// Search hashtags
export const searchHashtags = async (query: string, limit = 10): Promise<Hashtag[]> => {
  const response = await api.get(`/hashtags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data.data;
};

// Get posts by hashtag
export const getPostsByHashtag = async (hashtag: string, page = 1, limit = 20): Promise<PostsByHashtag> => {
  const response = await api.get(`/hashtags/${hashtag}/posts?page=${page}&limit=${limit}`);
  return response.data.data;
};
