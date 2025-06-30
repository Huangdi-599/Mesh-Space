import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

let socket: ReturnType<typeof io> | null = null;

export const useSocket = (onNotification: (data: any) => void) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_URL, {
        query: { userId: user._id },
        withCredentials: true,
      });

      socket.on('notification', onNotification);
    }

    return () => {
      socket?.off('notification', onNotification);
    };
  }, [user, onNotification]);
};
