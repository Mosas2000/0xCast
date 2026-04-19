import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailNotificationService } from './EmailNotificationService';

describe('EmailNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(EmailNotificationService.validateEmail('user@example.com')).toBe(true);
      expect(EmailNotificationService.validateEmail('john.doe@company.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(EmailNotificationService.validateEmail('invalid')).toBe(false);
      expect(EmailNotificationService.validateEmail('user@')).toBe(false);
      expect(EmailNotificationService.validateEmail('@example.com')).toBe(false);
    });
  });

  describe('sendPriceMovementAlert', () => {
    it('should generate correct alert content', async () => {
      const sendSpy = vi.spyOn(EmailNotificationService, 'sendEmail').mockResolvedValue(true);

      await EmailNotificationService.sendPriceMovementAlert(
        'user@example.com',
        'Bitcoin',
        45000,
        40000,
        5000
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Bitcoin'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendMarketExpiryReminder', () => {
    it('should send expiry reminder', async () => {
      const sendSpy = vi.spyOn(EmailNotificationService, 'sendEmail').mockResolvedValue(true);

      await EmailNotificationService.sendMarketExpiryReminder(
        'user@example.com',
        'BTC Over $50k?',
        7,
        'https://example.com/markets/btc'
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('7 Days'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendResolutionNotification', () => {
    it('should send resolution notification', async () => {
      const sendSpy = vi.spyOn(EmailNotificationService, 'sendEmail').mockResolvedValue(true);

      await EmailNotificationService.sendResolutionNotification(
        'user@example.com',
        'Bitcoin Market',
        'YES',
        'https://example.com/markets/btc'
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Resolved'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendLiquidityRewardReminder', () => {
    it('should send reward reminder', async () => {
      const sendSpy = vi.spyOn(EmailNotificationService, 'sendEmail').mockResolvedValue(true);

      await EmailNotificationService.sendLiquidityRewardReminder(
        'user@example.com',
        'ETH Market',
        1000,
        'https://example.com/rewards/claim'
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Reward'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendPortfolioUpdateSummary', () => {
    it('should send portfolio update', async () => {
      const sendSpy = vi.spyOn(EmailNotificationService, 'sendEmail').mockResolvedValue(true);

      await EmailNotificationService.sendPortfolioUpdateSummary(
        'user@example.com',
        50000,
        2000,
        4.2,
        'https://example.com/portfolio'
      );

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Portfolio'),
        })
      );

      sendSpy.mockRestore();
    });
  });

  describe('sendBulkEmails', () => {
    it('should send multiple emails', async () => {
      const sendSpy = vi.spyOn(EmailNotificationService, 'sendEmail').mockResolvedValue(true);

      const payloads = [
        {
          to: 'user1@example.com',
          subject: 'Alert 1',
          htmlBody: '<p>Test</p>',
          textBody: 'Test',
        },
        {
          to: 'user2@example.com',
          subject: 'Alert 2',
          htmlBody: '<p>Test</p>',
          textBody: 'Test',
        },
      ];

      const count = await EmailNotificationService.sendBulkEmails(payloads);

      expect(count).toBe(2);
      expect(sendSpy).toHaveBeenCalledTimes(2);

      sendSpy.mockRestore();
    });

    it('should handle partial failures', async () => {
      let callCount = 0;
      const sendSpy = vi
        .spyOn(EmailNotificationService, 'sendEmail')
        .mockImplementation(() => {
          callCount++;
          return Promise.resolve(callCount !== 2);
        });

      const payloads = Array(3).fill({
        to: 'user@example.com',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        textBody: 'Test',
      });

      const count = await EmailNotificationService.sendBulkEmails(payloads);

      expect(count).toBe(2);

      sendSpy.mockRestore();
    });
  });
});
