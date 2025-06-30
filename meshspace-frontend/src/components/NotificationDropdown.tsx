import { useNotifications } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { markNotificationAsRead } from '@/services/notification.service';

type Notification = {
  _id: string;
  isRead: boolean;
  post?: { _id: string };
  sender: { username: string };
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
      markAsRead(notification._id);
    }

    if (notification.post?._id) {
      navigate(`/post/${notification.post._id}`);
    } else {
      navigate(`/profile/${notification.sender.username}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative transition-transform duration-200 hover:scale-110">
          <Icon icon="mdi:bell-outline" className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 text-xs rounded-full bg-destructive text-white flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="animate-dropdown-fade-in">
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              onClick={() => handleClick(notification)}
              className={`cursor-pointer transition-colors duration-200 ${!notification.isRead ? 'bg-primary/10' : ''} hover:bg-primary/20`}
            >
              <div className="text-sm">
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt))} ago
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;

/* Add to global CSS (App.css or index.css):
@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-dropdown-fade-in {
  animation: dropdown-fade-in 0.3s ease;
}
*/
