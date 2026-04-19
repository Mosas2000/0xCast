import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PushNotificationService } from './PushNotificationService';

describe('PushNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestPermission', () => {
    it('should request notification permission', async () => {
      const permissionMock = vi.fn().mockResolvedValue('granted');

      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: permissionMock,
        },
        writable: true,
      });

      const permission = await PushNotificationService.requestPermission();

      expect(permission).toBeDefined();
    });
  });

  describe('hasPermission', () => {
    it('should return true if permission is granted', async () => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'granted',
        },
        writable: true,
      });

      const has = await PushNotificationService.hasPermission();

      expect(has).toBe(true);
    });

    it('should return false if permission is denied', async () => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'denied',
        },
        writable: true,
      });

      const has = await PushNotificationService.hasPermission();

      expect(has).toBe(false);
    });
  });

  describe('sendPriceMovementNotification', () => {
    it('should send price movement notification', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      await PushNotificationService.sendPriceMovementNotification(
        'Bitcoin',
        5000,
        12.5,
        1
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Bitcoin'),
          body: expect.stringContaining('up'),
        })
      );

      sendSpy.mockRestore();
    });

    it('should handle price decrease', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      await PushNotificationService.sendPriceMovementNotification(
        'Ethereum',
        -1000,
        -8.3,
        2
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('down'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendMarketExpiryNotification', () => {
    it('should send market expiry notification', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      await PushNotificationService.sendMarketExpiryNotification(
        'BTC Over 50k',
        7,
        123
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Expiring'),
          body: expect.stringContaining('7'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendResolutionNotification', () => {
    it('should send resolution notification', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      await PushNotificationService.sendResolutionNotification(
        'Bitcoin Market',
        'YES',
        123
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Resolved'),
          body: expect.stringContaining('YES'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendLiquidityRewardNotification', () => {
    it('should send reward notification', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      await PushNotificationService.sendLiquidityRewardNotification(
        'Ethereum Market',
        1000,
        123
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Reward'),
          body: expect.stringContaining('1000'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendSystemAlert', () => {
    it('should send system alert', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      await PushNotificationService.sendSystemAlert(
        'System Alert',
        'System maintenance',
        'sys_123'
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'System Alert',
          body: 'System maintenance',
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send multiple notifications', async () => {
      const sendSpy = vi.spyOn(PushNotificationService, 'sendNotification').mockResolvedValue(true);

      const payloads = [
        { title: 'Alert 1', body: 'Test' },
        { title: 'Alert 2', body: 'Test' },
        { title: 'Alert 3', body: 'Test' },
      ];

      const count = await PushNotificationService.sendBulkNotifications(payloads);

      expect(count).toBe(3);
      expect(sendSpy).toHaveBeenCalledTimes(3);

      sendSpy.mockRestore();
    });

    it('should handle partial failures', async () => {
      let callCount = 0;
      const sendSpy = vi
        .spyOn(PushNotificationService, 'sendNotification')
        .mockImplementation(() => {
          callCount++;
          return Promise.resolve(callCount !== 2);
        });

      const payloads = Array(3).fill({ title: 'Test', body: 'Test' });

      const count = await PushNotificationService.sendBulkNotifications(payloads);

      expect(count).toBe(2);

      sendSpy.mockRestore();
    });
  });
});
