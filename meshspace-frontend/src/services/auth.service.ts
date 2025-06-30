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

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}) => {
  try {
    const res = await API.post('/auth/register', data);
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to register user'));
  }
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const res = await API.post('/auth/login', data);
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to login'));
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await API.get('/user/me');
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch current user'));
  }
};

export const logoutUser = async () => {
  try {
    const res = await API.post('/auth/logout');
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to logout'));
  }
};

export const updateUserProfile = async (data: { username?: string; email?: string; avatar?: string }) => {
  try {
    const res = await API.put('/user/me', data);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to update profile'));
  }
};

export const verifyEmailToken = async (token: string) => {
  try {
    const res = await API.post('/auth/verify-email', { token });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to verify email'));
  }
};
