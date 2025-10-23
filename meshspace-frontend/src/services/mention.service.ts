import { api } from './api';

export interface Mention {
  _id: string;
  post: {
    _id: string;
    content: string;
    author: {
      _id: string;
      username: string;
      avatar?: string;
    };
    createdAt: string;
  };
  comment?: {
    _id: string;
    text: string;
    author: {
      _id: string;
      username: string;
      avatar?: string;
    };
    createdAt: string;
  };
  mentionedBy: {
    _id: string;
    username: string;
    avatar?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface UserSuggestion {
  _id: string;
  username: string;
  avatar?: string;
}

export const mentionService = {
  // Get user mentions
  getUserMentions: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(`/mentions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Mark mentions as read
  markMentionsAsRead: async (mentionIds: string[]) => {
    const response = await api.put('/mentions/mark-read', { mentionIds });
    return response.data;
  },

  // Get unread mention count
  getUnreadMentionCount: async () => {
    const response = await api.get('/mentions/unread-count');
    return response.data;
  },

  // Search users for mention suggestions
  searchUsers: async (query: string) => {
    const response = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
