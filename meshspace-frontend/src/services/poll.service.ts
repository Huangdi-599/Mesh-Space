import { api } from './api';

export interface PollOption {
  text: string;
  votes: string[];
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  expiresAt: string;
  allowMultiple: boolean;
  createdBy: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  postId?: string;
  totalVotes: number;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
  expiresAt: string;
  allowMultiple?: boolean;
  postId?: string;
}

export interface VoteData {
  optionIndexes: number[];
}

// Create a new poll
export const createPoll = async (pollData: CreatePollData): Promise<Poll> => {
  const response = await api.post('/polls', pollData);
  return response.data;
};

// Vote on a poll
export const votePoll = async (pollId: string, voteData: VoteData): Promise<Poll> => {
  const response = await api.post(`/polls/${pollId}/vote`, voteData);
  return response.data;
};

// Get poll results
export const getPollResults = async (pollId: string): Promise<Poll> => {
  const response = await api.get(`/polls/${pollId}/results`);
  return response.data;
};

// Get user's polls
export const getUserPolls = async (userId: string, page = 1, limit = 10): Promise<{
  polls: Poll[];
  totalPages: number;
  currentPage: number;
  total: number;
}> => {
  const response = await api.get(`/polls/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Delete a poll
export const deletePoll = async (pollId: string): Promise<void> => {
  await api.delete(`/polls/${pollId}`);
};
