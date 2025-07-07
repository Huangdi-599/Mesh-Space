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

export const followOrUnfollowUser = async (userId: string) => {
  try {
    const res = await API.post(`/user/${userId}/follow`);
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to update follow status'));
  }
};

export const getFollowers = async (userId: string) => {
  try {
    const res = await API.get(`/user/${userId}/followers`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch followers'));
  }
};

export const getFollowing = async (userId: string) => {
  try {
    const res = await API.get(`/user/${userId}/following`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch following'));
  }
};

export const getUserById = async (userId: string) => {
  try {
    const res = await API.get(`/user/${userId}`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch user'));
  }
};