import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification';

const STORAGE_KEY = 'oxcast_notifications';
const MAX_NOTIFICATIONS = 50;

/**
 * Hook for managing notifications
 * @returns Notifications state and management methods
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    // Save to localStorage whenever notifications change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }, [notifications]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS));
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, read: true }))
        );
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const dismissNotification = useCallback((notificationId: string) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        dismissNotification,
    };
}
