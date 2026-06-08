import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationPreferences } from './useNotificationPreferences';
import { NotificationService } from '../services/NotificationService';

vi.mock('../services/NotificationService');

describe('useNotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with user preferences', () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    expect(result.current.preferences).toEqual(mockPreferences);
  });

  it('should toggle notification type', async () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);
    vi.spyOn(NotificationService, 'setPreference').mockReturnValue(true);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    await act(async () => {
      result.current.toggleType('price_movement', 'in_app');
    });

    expect(NotificationService.setPreference).toHaveBeenCalled();
  });

  it('should update notification frequency', async () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);
    vi.spyOn(NotificationService, 'setPreference').mockReturnValue(true);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    await act(async () => {
      result.current.setFrequency('price_movement', 'in_app', 'daily');
    });

    expect(NotificationService.setPreference).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'price_movement',
        channel: 'in_app',
        frequency: 'daily',
      })
    );
  });

  it('should check if notification type is enabled', () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
      {
        userId: 'user123',
        type: 'market_expiry',
        channel: 'in_app',
        enabled: false,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    expect(result.current.isEnabled('price_movement', 'in_app')).toBe(true);
    expect(result.current.isEnabled('market_expiry', 'in_app')).toBe(false);
  });

  it('should get frequency for notification type', () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'daily',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    expect(result.current.getFrequency('price_movement', 'in_app')).toBe('daily');
  });

  it('should enable all notifications', async () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: false,
        frequency: 'immediate',
      },
      {
        userId: 'user123',
        type: 'market_expiry',
        channel: 'in_app',
        enabled: false,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);
    vi.spyOn(NotificationService, 'setPreference').mockReturnValue(true);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    await act(async () => {
      result.current.enableAll();
    });

    expect(NotificationService.setPreference).toHaveBeenCalled();
  });

  it('should disable all notifications', async () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
      {
        userId: 'user123',
        type: 'market_expiry',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);
    vi.spyOn(NotificationService, 'setPreference').mockReturnValue(true);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    await act(async () => {
      result.current.disableAll();
    });

    expect(NotificationService.setPreference).toHaveBeenCalled();
  });

  it('should reset preferences to defaults', async () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: false,
        frequency: 'weekly',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);
    vi.spyOn(NotificationService, 'setPreference').mockReturnValue(true);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    await act(async () => {
      result.current.resetToDefaults();
    });

    expect(NotificationService.setPreference).toHaveBeenCalled();
  });

  it('should update multiple channel preferences', async () => {
    const mockPreferences = [
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'in_app',
        enabled: true,
        frequency: 'immediate',
      },
      {
        userId: 'user123',
        type: 'price_movement',
        channel: 'email',
        enabled: false,
        frequency: 'immediate',
      },
    ];

    vi.spyOn(NotificationService, 'getUserPreferences').mockReturnValue(mockPreferences);
    vi.spyOn(NotificationService, 'setPreference').mockReturnValue(true);

    const { result } = renderHook(() => useNotificationPreferences('user123'));

    await act(async () => {
      result.current.toggleType('price_movement', 'email');
      result.current.toggleType('price_movement', 'in_app');
    });

    expect(NotificationService.setPreference).toHaveBeenCalledTimes(2);
  });
});
