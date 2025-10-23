import { api } from './api';

export interface SavedPostsResponse {
  posts: any[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Save a post to bookmarks
export const savePost = async (postId: string): Promise<{ message: string; savedCount: number }> => {
  const response = await api.post(`/bookmarks/${postId}`);
  return response.data;
};

// Remove a post from bookmarks
export const unsavePost = async (postId: string): Promise<{ message: string; savedCount: number }> => {
  const response = await api.delete(`/bookmarks/${postId}`);
  return response.data;
};

// Get user's saved posts
export const getSavedPosts = async (page = 1, limit = 20): Promise<SavedPostsResponse> => {
  const response = await api.get(`/bookmarks?page=${page}&limit=${limit}`);
  return response.data;
};

// Check if a post is saved
export const isPostSaved = async (postId: string): Promise<{ isSaved: boolean }> => {
  const response = await api.get(`/bookmarks/${postId}/check`);
  return response.data;
};

// Get saved posts count
export const getSavedPostsCount = async (): Promise<{ savedCount: number }> => {
  const response = await api.get('/bookmarks/count');
  return response.data;
};
