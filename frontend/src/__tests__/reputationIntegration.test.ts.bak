import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationManager } from '../services/ReputationManager';
import { reputationAnalytics } from '../utils/reputationAnalytics';

describe('Reputation System Integration Tests', () => {
  let manager: ReputationManager;

  beforeEach(() => {
    manager = new ReputationManager();
  });

  it('should initialize user reputation on first interaction', () => {
    const rep = manager.createUserReputation('user1');

    expect(rep.userId).toBe('user1');
    expect(rep.score.score).toBeGreaterThanOrEqual(0);
    expect(rep.level).toBe('new');
    expect(rep.kycStatus.status).toBe('none');
    expect(rep.isSuspicious).toBe(false);
    expect(rep.badges.length).toBeGreaterThanOrEqual(0);
  });

  it('should update reputation through trading activity', () => {
    manager.createUserReputation('user1');

    manager.updateReputationScore('user1', {
      completionRate: 0.95,
      transactionVolume: 50,
      averageResponseTime: 3,
      accountAgeDays: 90,
      verificationLevel: 'level1',
    });

    const rep = manager.getUserReputation('user1');
    expect(rep?.level).toBe('trusted');
  });

  it('should progress reputation through KYC verification', () => {
    manager.createUserReputation('user1');

    manager.submitKYC('user1', {
      firstName: 'John',
      lastName: 'Doe',
      documentType: 'passport',
      documentId: 'ABC123',
      dateOfBirth: '1990-01-01',
    });

    let rep = manager.getUserReputation('user1');
    expect(rep?.kycStatus.status).toBe('in_progress');

    manager.submitKYC('user1', {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
    });

    manager.submitKYC('user1', {
      faceImageHash: 'hash123',
      livenessScore: 0.98,
    });

    manager.approveKYC('user1');
    rep = manager.getUserReputation('user1');

    expect(rep?.kycStatus.status).toBe('approved');
    expect(rep?.badges.some((b) => b.type === 'verified_kyc')).toBe(true);
  });

  it('should detect and track suspicious activity', () => {
    manager.createUserReputation('user1');

    const alert = manager.checkFraudAlert('user1', 'wash_trading', [
      {
        price: 100,
        amount: 1000,
        timestamp: Date.now(),
        type: 'sell',
      },
      {
        price: 100,
        amount: 950,
        timestamp: Date.now() + 30000,
        type: 'buy',
      },
    ]);

    expect(alert).toBeDefined();

    const rep = manager.getUserReputation('user1');
    expect(rep?.isSuspicious).toBe(true);
  });

  it('should enable account linking with verification', () => {
    manager.createUserReputation('user1');

    const linkRequest = manager.linkAccount('user1', 'email', 'john@example.com');
    expect(linkRequest.type).toBe('email');
    expect(linkRequest.verificationCode).toBeDefined();

    const verified = manager.verifyLinkedAccount(linkRequest.id, linkRequest.verificationCode);
    expect(verified).toBe(true);
  });

  it('should calculate comprehensive metrics', () => {
    manager.createUserReputation('user1');
    manager.createUserReputation('user2');
    manager.createUserReputation('user3');

    manager.updateReputationScore('user1', {
      completionRate: 0.95,
      transactionVolume: 50,
      averageResponseTime: 3,
      accountAgeDays: 90,
      verificationLevel: 'level2',
    });

    manager.updateReputationScore('user2', {
      completionRate: 0.85,
      transactionVolume: 30,
      averageResponseTime: 4,
      accountAgeDays: 60,
      verificationLevel: 'level1',
    });

    const metrics = manager.getSystemMetrics();

    expect(metrics.averageScore).toBeGreaterThan(0);
    expect(metrics.totalUsers).toBe(3);
    expect(metrics.kycCompletionRate).toBeGreaterThanOrEqual(0);
  });

  it('should identify high risk users through monitoring', () => {
    manager.createUserReputation('user1');
    manager.createUserReputation('user2');

    manager.checkFraudAlert('user1', 'wash_trading', [
      { price: 100, amount: 1000, timestamp: Date.now(), type: 'sell' },
      { price: 100, amount: 950, timestamp: Date.now() + 30000, type: 'buy' },
    ]);

    manager.checkFraudAlert('user1', 'pump_and_dump', [
      { price: 100, volume: 1000, timestamp: Date.now() },
      { price: 130, volume: 3500, timestamp: Date.now() + 3600000 },
    ]);

    const highRiskUsers = manager.getHighRiskUsers();
    expect(highRiskUsers).toContain('user1');
  });

  it('should support AML compliance checks', () => {
    manager.createUserReputation('user1');

    manager.performAMLCheck('user1', {
      name: 'John Doe',
      country: 'USA',
      dateOfBirth: '1990-01-01',
    });

    const rep = manager.getUserReputation('user1');
    expect(rep?.amlStatus).toBeDefined();
    expect(rep?.amlStatus?.riskScore).toBeGreaterThanOrEqual(0);
  });

  it('should generate analytics on system state', () => {
    for (let i = 0; i < 10; i++) {
      manager.createUserReputation(`user${i}`);

      if (i % 2 === 0) {
        manager.updateReputationScore(`user${i}`, {
          completionRate: 0.9,
          transactionVolume: 50,
          averageResponseTime: 3,
          accountAgeDays: 180,
          verificationLevel: 'level3',
        });
      }
    }

    const distribution = manager.getReputationDistribution();
    expect(distribution.totalUsers).toBe(10);
    expect(distribution.eliteUsers + distribution.verifiedUsers + distribution.trustedUsers + distribution.newUsers).toBe(10);
  });

  it('should handle concurrent user operations safely', () => {
    const promises = [];

    for (let i = 0; i < 20; i++) {
      promises.push(
        Promise.resolve().then(() => {
          manager.createUserReputation(`concurrent_user${i}`);
          manager.updateReputationScore(`concurrent_user${i}`, {
            completionRate: 0.8,
            transactionVolume: 40,
            averageResponseTime: 4,
            accountAgeDays: 100,
            verificationLevel: 'level1',
          });
        }),
      );
    }

    return Promise.all(promises).then(() => {
      const users = manager.getSystemMetrics();
      expect(users.totalUsers).toBeGreaterThanOrEqual(20);
    });
  });

  it('should manage fraud alert lifecycle', () => {
    manager.createUserReputation('user1');

    manager.checkFraudAlert('user1', 'wash_trading', [
      { price: 100, amount: 1000, timestamp: Date.now(), type: 'sell' },
      { price: 100, amount: 950, timestamp: Date.now() + 30000, type: 'buy' },
    ]);

    let rep = manager.getUserReputation('user1');
    expect(rep?.isSuspicious).toBe(true);

    const alerts = manager.getFraudAlerts('user1');
    expect(alerts.length).toBeGreaterThan(0);

    const alert = alerts[0];
    manager.resolveFraudAlert(alert.id, 'False positive - legitimate trades');

    const resolvedAlerts = manager.getFraudAlerts('user1');
    const resolvedAlert = resolvedAlerts.find((a) => a.id === alert.id);
    expect(resolvedAlert?.resolved).toBe(true);
  });

  it('should support user reputation export', () => {
    manager.createUserReputation('user1');

    manager.updateReputationScore('user1', {
      completionRate: 0.95,
      transactionVolume: 50,
      averageResponseTime: 2,
      accountAgeDays: 180,
      verificationLevel: 'level3',
    });

    const rep = manager.getUserReputation('user1');
    expect(rep).toBeDefined();
    expect(rep?.userId).toBe('user1');
    expect(rep?.score).toBeDefined();
    expect(rep?.level).toBeDefined();
  });

  it('should track multiple account links per user', () => {
    manager.createUserReputation('user1');

    const emailLink = manager.linkAccount('user1', 'email', 'john@example.com');
    const phoneLink = manager.linkAccount('user1', 'phone', '+14155552671');
    const walletLink = manager.linkAccount('user1', 'wallet', 'ST1234567890ABCDEF');

    manager.verifyLinkedAccount(emailLink.id, emailLink.verificationCode);
    manager.verifyLinkedAccount(phoneLink.id, phoneLink.verificationCode);
    manager.verifyLinkedAccount(walletLink.id, walletLink.verificationCode);

    const rep = manager.getUserReputation('user1');
    expect(rep?.linkedAccounts.length).toBe(3);
  });
});
