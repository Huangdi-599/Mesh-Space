import API from '../lib/axios';

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as ErrorWithResponse).response === 'object' &&
    (error as ErrorWithResponse).response !== null &&
    'data' in (error as ErrorWithResponse).response! &&
    typeof (error as ErrorWithResponse).response!.data === 'object' &&
    (error as ErrorWithResponse).response!.data !== null &&
    'message' in (error as ErrorWithResponse).response!.data!
  ) {
    return (error as ErrorWithResponse).response!.data!.message as string;
  }
  return fallback;
}

export const createPost = async (formData: FormData) => {
  try {
    const res = await API.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to create post'));
  }
};

export const fetchFeed = async (page: number = 1, feedType: 'following' | 'trending' = 'following') => {
  try {
    const res = await API.get(`/posts/feed?page=${page}&limit=10&type=${feedType}`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch feed'));
  }
};

export const likePost = async (postId: string) => {
  try {
    const res = await API.post(`/posts/${postId}/like`);
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to like post'));
  }
};

export const addComment = async (postId: string, text: string, parentComment?: string) => {
  try {
    const res = await API.post(`/posts/${postId}/comments`, { text, parentComment });
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to add comment'));
  }
};

export const repostPost = async (postId: string, quote?: string) => {
  try {
    const res = await API.post(`/posts/${postId}/repost`, quote ? { quote } : {});
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to repost'));
  }
};

export const getComments = async (postId: string) => {
  try {
    const res = await API.get(`/posts/${postId}/comments`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch comments'));
  }
};

export const getPostsByUser = async (userId: string, page: number = 1) => {
  try {
    const res = await API.get(`/posts/user/${userId}?page=${page}&limit=10`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch user posts'));
  }
};

export const getPostById = async (postId: string) => {
  try {
    const res = await API.get(`/posts/${postId}`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch post'));
  }
};
