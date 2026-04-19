import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from './NotificationService';
import type { NotificationEvent, Notification } from '../types/notifications';

describe('NotificationService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification with correct structure', async () => {
      const event: NotificationEvent = {
        type: 'price_movement',
        userId: 'user1',
        content: {
          title: 'Price Alert',
          message: 'Bitcoin price moved up',
        },
      };

      const notification = await NotificationService.createNotification(event);

      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe('user1');
      expect(notification.type).toBe('price_movement');
      expect(notification.status).toBe('unread');
      expect(notification.createdAt).toBeDefined();
    });

    it('should set default channels to in_app', async () => {
      const event: NotificationEvent = {
        type: 'market_expiry',
        userId: 'user1',
        content: { title: 'Expiry', message: 'Market expires soon' },
      };

      const notification = await NotificationService.createNotification(event);

      expect(notification.channels).toContain('in_app');
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await NotificationService.createNotification({
          type: 'price_movement',
          userId: 'user1',
          content: { title: `Alert ${i}`, message: 'Test' },
        });
      }

      for (let i = 0; i < 3; i++) {
        await NotificationService.createNotification({
          type: 'market_expiry',
          userId: 'user2',
          content: { title: `Expiry ${i}`, message: 'Test' },
        });
      }
    });

    it('should filter by userId', async () => {
      const notifications = await NotificationService.getNotifications({
        userId: 'user1',
      });

      expect(notifications).toHaveLength(5);
      expect(notifications.every(n => n.userId === 'user1')).toBe(true);
    });

    it('should filter by status', async () => {
      const notifs = await NotificationService.getNotifications({
        userId: 'user1',
      });

      await NotificationService.markAsRead(notifs[0].id);

      const unread = await NotificationService.getNotifications({
        userId: 'user1',
        status: 'unread',
      });

      expect(unread.length).toBe(4);
    });

    it('should filter by type', async () => {
      const notifications = await NotificationService.getNotifications({
        userId: 'user1',
        type: 'price_movement',
      });

      expect(notifications.length).toBeLessThanOrEqual(5);
      expect(notifications.every(n => n.type === 'price_movement')).toBe(true);
    });

    it('should respect limit and offset', async () => {
      const page1 = await NotificationService.getNotifications({
        userId: 'user1',
        limit: 2,
        offset: 0,
      });

      expect(page1).toHaveLength(2);

      const page2 = await NotificationService.getNotifications({
        userId: 'user1',
        limit: 2,
        offset: 2,
      });

      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await NotificationService.createNotification({
        type: 'price_movement',
        userId: 'user1',
        content: { title: 'Alert', message: 'Test' },
      });

      const marked = await NotificationService.markAsRead(notification.id);

      expect(marked?.status).toBe('read');
      expect(marked?.readAt).toBeDefined();
    });

    it('should return null for invalid ID', async () => {
      const result = await NotificationService.markAsRead('invalid_id');
      expect(result).toBeNull();
    });
  });

  describe('archive', () => {
    it('should archive notification', async () => {
      const notification = await NotificationService.createNotification({
        type: 'price_movement',
        userId: 'user1',
        content: { title: 'Alert', message: 'Test' },
      });

      const archived = await NotificationService.archive(notification.id);

      expect(archived?.status).toBe('archived');
      expect(archived?.archivedAt).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      const notification = await NotificationService.createNotification({
        type: 'price_movement',
        userId: 'user1',
        content: { title: 'Alert', message: 'Test' },
      });

      const deleted = await NotificationService.delete(notification.id);

      expect(deleted).toBe(true);

      const found = await NotificationService.getNotifications({
        userId: 'user1',
      });

      expect(found.find(n => n.id === notification.id)).toBeUndefined();
    });
  });

  describe('bulkMarkAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      const n1 = await NotificationService.createNotification({
        type: 'price_movement',
        userId: 'user1',
        content: { title: 'Alert 1', message: 'Test' },
      });

      const n2 = await NotificationService.createNotification({
        type: 'market_expiry',
        userId: 'user1',
        content: { title: 'Alert 2', message: 'Test' },
      });

      await NotificationService.bulkMarkAsRead([n1.id, n2.id]);

      const updated = await NotificationService.getNotifications({
        userId: 'user1',
      });

      expect(updated.every(n => n.status === 'read')).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', async () => {
      for (let i = 0; i < 3; i++) {
        await NotificationService.createNotification({
          type: 'price_movement',
          userId: 'user1',
          content: { title: `Alert ${i}`, message: 'Test' },
        });
      }

      const count = await NotificationService.getUnreadCount('user1');

      expect(count).toBe(3);
    });
  });

  describe('notification preferences', () => {
    it('should set preference', async () => {
      const pref = await NotificationService.setPreference({
        userId: 'user1',
        type: 'price_movement',
        channel: 'email',
        frequency: 'daily',
        enabled: true,
      });

      expect(pref.userId).toBe('user1');
      expect(pref.enabled).toBe(true);
    });

    it('should get user preferences', async () => {
      await NotificationService.setPreference({
        userId: 'user1',
        type: 'price_movement',
        channel: 'email',
        frequency: 'daily',
        enabled: true,
      });

      const prefs = await NotificationService.getUserPreferences('user1');

      expect(prefs.length).toBeGreaterThan(0);
      expect(prefs[0].userId).toBe('user1');
    });

    it('should update preference', async () => {
      const pref = await NotificationService.setPreference({
        userId: 'user1',
        type: 'price_movement',
        channel: 'email',
        frequency: 'daily',
        enabled: true,
      });

      const updated = await NotificationService.updatePreference(pref.id, {
        frequency: 'weekly',
        enabled: false,
      });

      expect(updated?.frequency).toBe('weekly');
      expect(updated?.enabled).toBe(false);
    });

    it('should delete preference', async () => {
      const pref = await NotificationService.setPreference({
        userId: 'user1',
        type: 'price_movement',
        channel: 'email',
        frequency: 'daily',
        enabled: true,
      });

      const deleted = await NotificationService.deletePreference(pref.id);

      expect(deleted).toBe(true);

      const prefs = await NotificationService.getUserPreferences('user1');

      expect(prefs.find(p => p.id === pref.id)).toBeUndefined();
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification stats', async () => {
      for (let i = 0; i < 3; i++) {
        await NotificationService.createNotification({
          type: 'price_movement',
          userId: 'user1',
          content: { title: `Alert ${i}`, message: 'Test' },
        });
      }

      const stats = await NotificationService.getNotificationStats('user1');

      expect(stats.totalNotifications).toBe(3);
      expect(stats.unreadCount).toBe(3);
      expect(stats.readCount).toBe(0);
    });
  });
});
