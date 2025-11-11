import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  itemId?: string;
  isRead: boolean;
  createdAt: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      console.log('[CLIENT] Fetching notifications...');
      const response = await fetch('/api/user/notifications');
      if (response.ok) {
        const data = await response.json();
        console.log('[CLIENT] Received notifications:', data);
        setNotifications(data.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt)
        })));
      } else {
        console.error('[CLIENT] Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/user/notifications/count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications/read-all', {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/user/notifications/clear', {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error clearing notification history:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 10 seconds for more responsive updates
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 10000);
      
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearHistory,
    refetch: () => {
      fetchNotifications();
      fetchUnreadCount();
    }
  };
}
