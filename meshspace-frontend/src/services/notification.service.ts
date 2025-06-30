// services/notification.service.ts
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

export const getNotifications = async () => {
  try {
    const res = await API.get('/notifications');
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch notifications'));
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const res = await API.patch(`/notifications/${id}/read`);
    return res.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to mark notification as read'));
  }
};
