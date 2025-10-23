import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getNotifications } from '@/services/notification.service';

export const useSocket = (onNotification: (data: unknown) => void) => {
  const { user } = useAuth();
  const lastNotificationCount = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Poll for new notifications every 10 seconds
    const pollNotifications = async () => {
      try {
        const notifications = await getNotifications();
        const currentCount = notifications.length;
        
        // If we have new notifications, trigger the callback
        if (currentCount > lastNotificationCount.current) {
          const newNotifications = notifications.slice(0, currentCount - lastNotificationCount.current);
          newNotifications.forEach((notification: unknown) => {
            onNotification(notification);
          });
        }
        
        lastNotificationCount.current = currentCount;
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Start polling
    intervalRef.current = setInterval(pollNotifications, 10000); // Poll every 10 seconds
    
    // Initial poll
    pollNotifications();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, onNotification]);
};
