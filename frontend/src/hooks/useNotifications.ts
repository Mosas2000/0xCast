import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '../services/NotificationService';
import type {
  Notification,
  NotificationPreference,
  NotificationQuery,
  NotificationStats,
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
} from '../types/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (query: NotificationQuery) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  archive: (notificationId: string) => Promise<void>;
  delete: (notificationId: string) => Promise<void>;
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  bulkArchive: (ids: string[]) => Promise<void>;
  getStats: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(userId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (query: NotificationQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await NotificationService.getNotifications(query);
        setNotifications(result);

        const count = await NotificationService.getUnreadCount(userId);
        setUnreadCount(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'read' } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsUnread(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'unread' } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as unread');
    }
  }, []);

  const archive = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.archive(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'archived' } : n
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, []);

  const bulkMarkAsRead = useCallback(async (ids: string[]) => {
    try {
      await NotificationService.bulkMarkAsRead(ids);
      setNotifications(prev =>
        prev.map(n =>
          ids.includes(n.id) ? { ...n, status: 'read' } : n
        )
      );
      const count = await NotificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, [userId]);

  const bulkArchive = useCallback(async (ids: string[]) => {
    try {
      await NotificationService.bulkArchive(ids);
      setNotifications(prev =>
        prev.map(n =>
          ids.includes(n.id) ? { ...n, status: 'archived' } : n
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive');
    }
  }, []);

  const getStats = useCallback(
    async (statsUserId: string) => {
      try {
        const result = await NotificationService.getNotificationStats(statsUserId);
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get stats');
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    const query: NotificationQuery = {
      userId,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    await fetchNotifications(query);
    await getStats(userId);
  }, [userId, fetchNotifications, getStats]);

  useEffect(() => {
    refresh();
  }, []);

  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    archive,
    delete: deleteNotification,
    bulkMarkAsRead,
    bulkArchive,
    getStats,
    refresh,
  };
}
