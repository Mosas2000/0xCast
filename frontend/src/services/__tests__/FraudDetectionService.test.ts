import { describe, it, expect, beforeEach } from 'vitest';
import { FraudDetectionService } from '../FraudDetectionService';

describe('FraudDetectionService', () => {
  let service: FraudDetectionService;

  beforeEach(() => {
    service = new FraudDetectionService();
  });

  describe('detectWashTrading', () => {
    it('should detect wash trading patterns', () => {
      const transactions = [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ];

      const detected = service.detectWashTrading('user1', transactions);
      expect(detected).toBe(true);

      const alerts = service.getAlerts('user1');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should not detect wash trading with different prices', () => {
      const transactions = [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 150, volume: 51, marketId: 'm1' },
      ];

      const detected = service.detectWashTrading('user1', transactions);
      expect(detected).toBe(false);
    });

    it('should not detect wash trading with large time delta', () => {
      const transactions = [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 100000, price: 100.5, volume: 51, marketId: 'm1' },
      ];

      const detected = service.detectWashTrading('user1', transactions);
      expect(detected).toBe(false);
    });
  });

  describe('detectSybilAttack', () => {
    it('should detect sybil attack patterns', () => {
      const accounts = [
        { id: 'a1', ipAddress: '192.168.1.1', createdAt: 1000, tradingPatterns: {} },
        { id: 'a2', ipAddress: '192.168.1.1', createdAt: 1100, tradingPatterns: {} },
        { id: 'a3', ipAddress: '192.168.1.1', createdAt: 1200, tradingPatterns: {} },
      ];

      const detected = service.detectSybilAttack('user1', accounts);
      expect(detected).toBe(true);

      const alerts = service.getAlerts('user1');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should not detect sybil with different IPs and times', () => {
      const accounts = [
        { id: 'a1', ipAddress: '192.168.1.1', createdAt: 1000, tradingPatterns: {} },
        { id: 'a2', ipAddress: '192.168.1.2', createdAt: 100000000, tradingPatterns: {} },
      ];

      const detected = service.detectSybilAttack('user1', accounts);
      expect(detected).toBe(false);
    });
  });

  describe('detectPumpDump', () => {
    it('should detect pump and dump patterns', () => {
      const transactions = [
        { timestamp: 1000, price: 100, volume: 10 },
        { timestamp: 2000, price: 110, volume: 50 },
        { timestamp: 3000, price: 120, volume: 100 },
        { timestamp: 4000, price: 150, volume: 200 },
        { timestamp: 5000, price: 180, volume: 150 },
      ];

      const detected = service.detectPumpDump('user1', transactions);
      expect(detected).toBe(true);
    });

    it('should not detect pump and dump with stable prices', () => {
      const transactions = [
        { timestamp: 1000, price: 100, volume: 10 },
        { timestamp: 2000, price: 101, volume: 11 },
        { timestamp: 3000, price: 100, volume: 10 },
        { timestamp: 4000, price: 102, volume: 12 },
        { timestamp: 5000, price: 101, volume: 11 },
      ];

      const detected = service.detectPumpDump('user1', transactions);
      expect(detected).toBe(false);
    });
  });

  describe('detectPriceManipulation', () => {
    it('should detect price manipulation', () => {
      const transactions = [
        { price: 150 },
        { price: 155 },
        { price: 160 },
      ];

      const detected = service.detectPriceManipulation('user1', transactions, 100);
      expect(detected).toBe(true);
    });

    it('should not detect manipulation with fair prices', () => {
      const transactions = [
        { price: 100 },
        { price: 102 },
        { price: 98 },
      ];

      const detected = service.detectPriceManipulation('user1', transactions, 100);
      expect(detected).toBe(false);
    });
  });

  describe('detectVolumeSpoofing', () => {
    it('should detect volume spoofing', () => {
      const orderBook = [
        { volume: 15000, cancelled: true },
        { volume: 20000, cancelled: true },
        { volume: 18000, cancelled: true },
        { volume: 100, cancelled: false },
      ];

      const detected = service.detectVolumeSpoofing('user1', orderBook);
      expect(detected).toBe(true);
    });

    it('should not detect spoofing with executed orders', () => {
      const orderBook = [
        { volume: 15000, cancelled: false },
        { volume: 20000, cancelled: false },
        { volume: 18000, cancelled: false },
      ];

      const detected = service.detectVolumeSpoofing('user1', orderBook);
      expect(detected).toBe(false);
    });
  });

  describe('detectUnusualPattern', () => {
    it('should detect unusual patterns for new accounts', () => {
      const userProfile = {
        createdAt: Date.now() - 3600000,
        totalTransactions: 150,
      };

      const detected = service.detectUnusualPattern('user1', userProfile);
      expect(detected).toBe(true);
    });

    it('should not detect unusual patterns for normal accounts', () => {
      const userProfile = {
        createdAt: Date.now() - 86400000 * 30,
        totalTransactions: 50,
      };

      const detected = service.detectUnusualPattern('user1', userProfile);
      expect(detected).toBe(false);
    });
  });

  describe('alert management', () => {
    it('should acknowledge alerts', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const alerts = service.getAlerts('user1');
      const alertId = alerts[0].alertId;

      const acknowledged = service.acknowledgeAlert(alertId);
      expect(acknowledged.status).toBe('acknowledged');
    });

    it('should resolve alerts', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const alerts = service.getAlerts('user1');
      const alertId = alerts[0].alertId;

      const resolved = service.resolveAlert(alertId);
      expect(resolved.status).toBe('resolved');
    });
  });

  describe('suspicious activity management', () => {
    it('should investigate suspicious activities', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const activities = service.getSuspiciousActivities('user1');
      const activityId = activities[0].activityId;

      const investigated = service.investigateSuspiciousActivity(activityId);
      expect(investigated.status).toBe('investigating');
    });

    it('should confirm suspicious activities', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const activities = service.getSuspiciousActivities('user1');
      const activityId = activities[0].activityId;

      const confirmed = service.confirmSuspiciousActivity(activityId);
      expect(confirmed.status).toBe('confirmed');
    });

    it('should dismiss suspicious activities', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const activities = service.getSuspiciousActivities('user1');
      const activityId = activities[0].activityId;

      const dismissed = service.dismissSuspiciousActivity(activityId);
      expect(dismissed.status).toBe('dismissed');
    });
  });

  describe('risk scoring', () => {
    it('should calculate risk score', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const activities = service.getSuspiciousActivities('user1');
      service.confirmSuspiciousActivity(activities[0].activityId);

      const riskScore = service.getRiskScore('user1');
      expect(riskScore).toBeGreaterThan(0);
    });

    it('should identify high risk users', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const activities = service.getSuspiciousActivities('user1');
      service.confirmSuspiciousActivity(activities[0].activityId);

      const highRiskUsers = service.getHighRiskUsers(30);
      expect(highRiskUsers).toContain('user1');
    });
  });

  describe('trading behavior analysis', () => {
    it('should analyze trading behavior', () => {
      const transactions = [
        { timestamp: 1000, price: 100, volume: 10, marketId: 'm1' },
        { timestamp: 2000, price: 101, volume: 12, marketId: 'm1' },
        { timestamp: 3000, price: 102, volume: 11, marketId: 'm2' },
      ];

      const behavior = service.analyzeTradingBehavior('user1', transactions);
      expect(behavior.userId).toBe('user1');
      expect(behavior.averageTradeSize).toBeGreaterThan(0);
      expect(behavior.preferredMarkets).toContain('m1');
    });

    it('should detect anomalous behavior', () => {
      const transactions = [
        { timestamp: Date.now() - 86400000, price: 100, volume: 10, marketId: 'm1' },
        { timestamp: Date.now() - 86300000, price: 101, volume: 12, marketId: 'm1' },
      ];

      service.analyzeTradingBehavior('user1', transactions);

      const anomalousTransaction = {
        timestamp: Date.now(),
        price: 200,
        volume: 1000,
        marketId: 'm2',
      };

      const detected = service.detectAnomalousBehavior('user1', anomalousTransaction);
      expect(detected).toBe(true);
    });
  });

  describe('fraud report generation', () => {
    it('should generate comprehensive fraud report', () => {
      service.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);

      const report = service.generateFraudReport('user1');
      expect(report.riskScore).toBeGreaterThan(0);
      expect(report.alerts.length).toBeGreaterThan(0);
      expect(report.suspiciousActivities.length).toBeGreaterThan(0);
      expect(report.recommendation).toBeDefined();
    });
  });
});
