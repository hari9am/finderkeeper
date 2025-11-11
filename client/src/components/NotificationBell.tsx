import { Bell, Check, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearHistory, refetch } = useNotifications();

  if (!isAuthenticated) {
    return null;
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        sideOffset={8}
        className="w-80 max-h-96 overflow-y-auto mr-4"
        avoidCollisions={true}
        collisionPadding={16}
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-medium">Notifications</p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-auto p-1 text-xs"
              title="Refresh notifications"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                title="Clear notification history"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              asChild
              className={`cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500' : ''}`}
            >
              <div
                onClick={() => handleNotificationClick(notification)}
                className={`flex flex-col gap-1 p-3 hover:bg-accent transition-colors ${!notification.isRead ? 'font-medium' : 'opacity-75'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>
                {notification.itemId && (
                  <Link href={`/browse?highlight=${notification.itemId}`}>
                    <Button variant="outline" size="sm" className="mt-1 h-6 text-xs">
                      View Item
                    </Button>
                  </Link>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="text-center text-sm">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
