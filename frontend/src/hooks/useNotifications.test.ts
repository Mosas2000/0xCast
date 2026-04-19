import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { NotificationService } from '../services/NotificationService';

vi.mock('../services/NotificationService');

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with empty notifications', () => {
    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue([]);

    const { result } = renderHook(() => useNotifications('user123'));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should fetch notifications on mount', () => {
    const mockNotifications = [
      {
        id: '1',
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        title: 'Price Alert',
        message: 'BTC moved up',
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'BTC' },
      },
    ];

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue(mockNotifications);

    const { result } = renderHook(() => useNotifications('user123'));

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notification as read', async () => {
    const mockNotification = {
      id: '1',
      userId: 'user123',
      type: 'price_movement',
      channel: 'in_app',
      title: 'Price Alert',
      message: 'BTC moved up',
      read: false,
      archived: false,
      createdAt: new Date(),
      metadata: { market: 'BTC' },
    };

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue([mockNotification]);
    vi.spyOn(NotificationService, 'markAsRead').mockReturnValue(true);

    const { result } = renderHook(() => useNotifications('user123'));

    await act(async () => {
      result.current.markAsRead('1');
    });

    expect(NotificationService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should mark notification as unread', async () => {
    const mockNotification = {
      id: '1',
      userId: 'user123',
      type: 'price_movement',
      channel: 'in_app',
      title: 'Price Alert',
      message: 'BTC moved up',
      read: true,
      archived: false,
      createdAt: new Date(),
      metadata: { market: 'BTC' },
    };

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue([mockNotification]);
    vi.spyOn(NotificationService, 'markAsUnread').mockReturnValue(true);

    const { result } = renderHook(() => useNotifications('user123'));

    await act(async () => {
      result.current.markAsUnread('1');
    });

    expect(NotificationService.markAsUnread).toHaveBeenCalledWith('1');
  });

  it('should archive notification', async () => {
    const mockNotification = {
      id: '1',
      userId: 'user123',
      type: 'price_movement',
      channel: 'in_app',
      title: 'Price Alert',
      message: 'BTC moved up',
      read: false,
      archived: false,
      createdAt: new Date(),
      metadata: { market: 'BTC' },
    };

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue([mockNotification]);
    vi.spyOn(NotificationService, 'archiveNotification').mockReturnValue(true);

    const { result } = renderHook(() => useNotifications('user123'));

    await act(async () => {
      result.current.archiveNotification('1');
    });

    expect(NotificationService.archiveNotification).toHaveBeenCalledWith('1');
  });

  it('should delete notification', async () => {
    const mockNotification = {
      id: '1',
      userId: 'user123',
      type: 'price_movement',
      channel: 'in_app',
      title: 'Price Alert',
      message: 'BTC moved up',
      read: false,
      archived: false,
      createdAt: new Date(),
      metadata: { market: 'BTC' },
    };

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue([mockNotification]);
    vi.spyOn(NotificationService, 'deleteNotification').mockReturnValue(true);

    const { result } = renderHook(() => useNotifications('user123'));

    await act(async () => {
      result.current.deleteNotification('1');
    });

    expect(NotificationService.deleteNotification).toHaveBeenCalledWith('1');
  });

  it('should clear all notifications', async () => {
    const mockNotifications = [
      {
        id: '1',
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        title: 'Price Alert',
        message: 'BTC moved up',
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'BTC' },
      },
      {
        id: '2',
        userId: 'user123',
        type: 'market_expiry',
        channel: 'in_app',
        title: 'Market Expiring',
        message: 'Market expires soon',
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'ETH' },
      },
    ];

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue(mockNotifications);
    vi.spyOn(NotificationService, 'deleteNotification').mockReturnValue(true);

    const { result } = renderHook(() => useNotifications('user123'));

    await act(async () => {
      result.current.clearAll();
    });

    expect(NotificationService.deleteNotification).toHaveBeenCalledTimes(2);
  });

  it('should get notification statistics', () => {
    const mockNotifications = [
      {
        id: '1',
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        title: 'Price Alert',
        message: 'BTC moved up',
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'BTC' },
      },
      {
        id: '2',
        userId: 'user123',
        type: 'market_expiry',
        channel: 'in_app',
        title: 'Market Expiring',
        message: 'Market expires soon',
        read: true,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'ETH' },
      },
    ];

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue(mockNotifications);

    const { result } = renderHook(() => useNotifications('user123'));

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications).toHaveLength(2);
  });

  it('should filter notifications by type', () => {
    const mockNotifications = [
      {
        id: '1',
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        title: 'Price Alert',
        message: 'BTC moved up',
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'BTC' },
      },
      {
        id: '2',
        userId: 'user123',
        type: 'market_expiry',
        channel: 'in_app',
        title: 'Market Expiring',
        message: 'Market expires soon',
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: { market: 'ETH' },
      },
    ];

    vi.spyOn(NotificationService, 'getNotifications').mockReturnValue(mockNotifications);
    vi.spyOn(NotificationService, 'getNotificationsByType').mockReturnValue([mockNotifications[0]]);

    const { result } = renderHook(() => useNotifications('user123'));

    const filtered = result.current.getByType('price_movement');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe('price_movement');
  });
});
