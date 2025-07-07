import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/services/notification.service';
import { useSocket } from '@/hooks/useSocket'; // your hook that listens for socket events
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type Notification = {
  _id: string;
  recipient: string;
  sender: { username: string };
  message: string;
  post?: { _id: string };
  isRead: boolean;
  createdAt: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch initial notifications using TanStack React Query
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);

  useSocket((newNotification: any) => {
    refetch()
    setNotifications((prev) => [newNotification, ...prev]);

    toast.custom((t) => (
      <div className="flex items-center gap-3 p-3 rounded-lg shadow bg-background border animate-fade-in">
        <Avatar className="size-9">
          {newNotification.sender?.avatar ? (
            <AvatarImage src={newNotification.sender.avatar} alt={newNotification.sender.username} />
          ) : (
            <AvatarFallback>{newNotification.sender?.username?.[0] || '?'}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="font-medium text-base text-foreground">{newNotification.message}</div>
        </div>
        <button
          className="ml-2 px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors"
          onClick={() => {
            if (newNotification.post?._id) {
              window.location.href = `/post/${newNotification.post._id}`;
            } else {
              window.location.href = `/profile/${newNotification.sender.username}`;
            }
            toast.dismiss(t);
          }}
        >
          View
        </button>
      </div>
    ));
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
