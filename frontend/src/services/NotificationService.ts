import type {
  Notification,
  NotificationPreference,
  NotificationEvent,
  NotificationQuery,
  NotificationPreferenceUpdate,
  NotificationStatus,
  NotificationType,
} from '../types/notifications';

export class NotificationService {
  private static readonly STORAGE_KEY = 'notifications';
  private static readonly PREFERENCES_KEY = 'notification_preferences';

  static async createNotification(
    event: NotificationEvent
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: event.userId,
      type: event.type,
      content: event.content,
      channels: event.channels || ['in_app'],
      status: 'unread',
      createdAt: new Date().toISOString(),
      metadata: event.metadata,
    };

    await this.saveNotification(notification);
    return notification;
  }

  static async getNotifications(query: NotificationQuery): Promise<Notification[]> {
    const notifications = this.getAllNotifications();
    let filtered = notifications.filter(n => n.userId === query.userId);

    if (query.status) {
      filtered = filtered.filter(n => n.status === query.status);
    }

    if (query.type) {
      filtered = filtered.filter(n => n.type === query.type);
    }

    const sortKey = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    filtered.sort((a, b) => {
      const aVal = new Date(a[sortKey as keyof Notification]).getTime();
      const bVal = new Date(b[sortKey as keyof Notification]).getTime();
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const offset = query.offset || 0;
    const limit = query.limit || 50;

    return filtered.slice(offset, offset + limit);
  }

  static async markAsRead(notificationId: string): Promise<Notification | null> {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date().toISOString();
      this.saveAllNotifications(notifications);
      return notification;
    }

    return null;
  }

  static async markAsUnread(notificationId: string): Promise<Notification | null> {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.status = 'unread';
      notification.readAt = undefined;
      this.saveAllNotifications(notifications);
      return notification;
    }

    return null;
  }

  static async archive(notificationId: string): Promise<Notification | null> {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.status = 'archived';
      notification.archivedAt = new Date().toISOString();
      this.saveAllNotifications(notifications);
      return notification;
    }

    return null;
  }

  static async delete(notificationId: string): Promise<boolean> {
    const notifications = this.getAllNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);

    if (filtered.length < notifications.length) {
      this.saveAllNotifications(filtered);
      return true;
    }

    return false;
  }

  static async bulkMarkAsRead(notificationIds: string[]): Promise<Notification[]> {
    const notifications = this.getAllNotifications();
    const updated: Notification[] = [];

    notificationIds.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        notification.status = 'read';
        notification.readAt = new Date().toISOString();
        updated.push(notification);
      }
    });

    this.saveAllNotifications(notifications);
    return updated;
  }

  static async bulkArchive(notificationIds: string[]): Promise<Notification[]> {
    const notifications = this.getAllNotifications();
    const updated: Notification[] = [];

    notificationIds.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        notification.status = 'archived';
        notification.archivedAt = new Date().toISOString();
        updated.push(notification);
      }
    });

    this.saveAllNotifications(notifications);
    return updated;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const notifications = this.getAllNotifications();
    return notifications.filter(
      n => n.userId === userId && n.status === 'unread'
    ).length;
  }

  static async getNotificationStats(userId: string) {
    const notifications = this.getAllNotifications().filter(
      n => n.userId === userId
    );

    return {
      userId,
      totalNotifications: notifications.length,
      unreadCount: notifications.filter(n => n.status === 'unread').length,
      readCount: notifications.filter(n => n.status === 'read').length,
      archivedCount: notifications.filter(n => n.status === 'archived').length,
      lastNotificationAt:
        notifications.length > 0
          ? notifications[0].createdAt
          : undefined,
      preferenceCount: this.getUserPreferencesCount(userId),
    };
  }

  static async setPreference(
    preference: Omit<NotificationPreference, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NotificationPreference> {
    const preferences = this.getAllPreferences();
    const existing = preferences.find(
      p =>
        p.userId === preference.userId &&
        p.type === preference.type &&
        p.channel === preference.channel
    );

    const now = new Date().toISOString();

    if (existing) {
      existing.frequency = preference.frequency;
      existing.enabled = preference.enabled;
      existing.updatedAt = now;
    } else {
      const newPref: NotificationPreference = {
        id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...preference,
        createdAt: now,
        updatedAt: now,
      };
      preferences.push(newPref);
    }

    this.saveAllPreferences(preferences);
    return existing || preferences[preferences.length - 1];
  }

  static async getPreference(
    userId: string,
    type: NotificationType,
    channel: string
  ): Promise<NotificationPreference | null> {
    const preferences = this.getAllPreferences();
    return (
      preferences.find(
        p =>
          p.userId === userId &&
          p.type === type &&
          p.channel === (channel as any)
      ) || null
    );
  }

  static async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    const preferences = this.getAllPreferences();
    return preferences.filter(p => p.userId === userId);
  }

  static async updatePreference(
    preferenceId: string,
    updates: NotificationPreferenceUpdate
  ): Promise<NotificationPreference | null> {
    const preferences = this.getAllPreferences();
    const preference = preferences.find(p => p.id === preferenceId);

    if (preference) {
      if (updates.frequency !== undefined) {
        preference.frequency = updates.frequency;
      }
      if (updates.enabled !== undefined) {
        preference.enabled = updates.enabled;
      }
      preference.updatedAt = new Date().toISOString();
      this.saveAllPreferences(preferences);
      return preference;
    }

    return null;
  }

  static async deletePreference(preferenceId: string): Promise<boolean> {
    const preferences = this.getAllPreferences();
    const filtered = preferences.filter(p => p.id !== preferenceId);

    if (filtered.length < preferences.length) {
      this.saveAllPreferences(filtered);
      return true;
    }

    return false;
  }

  static async clearUserNotifications(userId: string): Promise<number> {
    const notifications = this.getAllNotifications();
    const beforeCount = notifications.length;
    const filtered = notifications.filter(n => n.userId !== userId);
    this.saveAllNotifications(filtered);
    return beforeCount - filtered.length;
  }

  static async deleteOldNotifications(daysOld: number): Promise<number> {
    const notifications = this.getAllNotifications();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const beforeCount = notifications.length;
    const filtered = notifications.filter(
      n => new Date(n.createdAt) > cutoffDate
    );
    this.saveAllNotifications(filtered);
    return beforeCount - filtered.length;
  }

  private static saveNotification(notification: Notification): void {
    const notifications = this.getAllNotifications();
    notifications.unshift(notification);
    this.saveAllNotifications(notifications);
  }

  private static getAllNotifications(): Notification[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveAllNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      console.error('Failed to save notifications');
    }
  }

  private static getAllPreferences(): NotificationPreference[] {
    try {
      const data = localStorage.getItem(this.PREFERENCES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveAllPreferences(preferences: NotificationPreference[]): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      console.error('Failed to save preferences');
    }
  }

  private static getUserPreferencesCount(userId: string): number {
    return this.getAllPreferences().filter(p => p.userId === userId).length;
  }
}
