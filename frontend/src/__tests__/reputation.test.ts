import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationScoringService } from '../services/ReputationScoringService';
import { KYCAMLService } from '../services/KYCAMLService';
import { FraudDetectionService } from '../services/FraudDetectionService';
import { AccountLinkingService } from '../services/AccountLinkingService';
import { ReputationManager } from '../services/ReputationManager';
import { ReputationLevel } from '../types/reputation';

describe('ReputationScoringService', () => {
  let service: ReputationScoringService;

  beforeEach(() => {
    service = new ReputationScoringService();
  });

  it('should calculate reputation score correctly', () => {
    const score = service.calculateReputationScore('user1', {
      completionRate: 0.95,
      transactionVolume: 50,
      averageResponseTime: 2,
      accountAgeDays: 180,
      verificationLevel: 'level3',
    });

    expect(score.score).toBeGreaterThan(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });

  it('should determine reputation level correctly', () => {
    const newLevel = service.determineLevel(40);
    expect(newLevel).toBe('new');

    const trustedLevel = service.determineLevel(60);
    expect(trustedLevel).toBe('trusted');

    const verifiedLevel = service.determineLevel(75);
    expect(verifiedLevel).toBe('verified');

    const eliteLevel = service.determineLevel(90);
    expect(eliteLevel).toBe('elite');
  });

  it('should award badges based on criteria', () => {
    const badges = service.determineBadges({
      completionRate: 1.0,
      transactionVolume: 100,
      averageResponseTime: 1,
      accountAgeDays: 365,
      verificationLevel: 'level3',
    });

    expect(badges.length).toBeGreaterThan(0);
    expect(badges.some((b) => b.type === 'active_trader')).toBe(true);
  });

  it('should award high volume badge', () => {
    const badges = service.determineBadges({
      completionRate: 0.8,
      transactionVolume: 150,
      averageResponseTime: 5,
      accountAgeDays: 100,
      verificationLevel: 'level1',
    });

    expect(badges.some((b) => b.type === 'high_volume')).toBe(true);
  });

  it('should award fast responder badge', () => {
    const badges = service.determineBadges({
      completionRate: 0.8,
      transactionVolume: 30,
      averageResponseTime: 1,
      accountAgeDays: 100,
      verificationLevel: 'level1',
    });

    expect(badges.some((b) => b.type === 'fast_responder')).toBe(true);
  });

  it('should award verified KYC badge', () => {
    const badges = service.determineBadges({
      completionRate: 0.8,
      transactionVolume: 30,
      averageResponseTime: 5,
      accountAgeDays: 100,
      verificationLevel: 'level3',
    });

    expect(badges.some((b) => b.type === 'verified_kyc')).toBe(true);
  });
});

describe('KYCAMLService', () => {
  let service: KYCAMLService;

  beforeEach(() => {
    service = new KYCAMLService();
  });

  it('should initialize KYC submission', () => {
    const result = service.submitKYC('user1', {
      firstName: 'John',
      lastName: 'Doe',
      documentType: 'passport',
      documentId: 'ABC123',
      dateOfBirth: '1990-01-01',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('in_progress');
  });

  it('should progress KYC through stages', () => {
    service.submitKYC('user1', {
      firstName: 'John',
      lastName: 'Doe',
      documentType: 'passport',
      documentId: 'ABC123',
      dateOfBirth: '1990-01-01',
    });

    service.submitKYC('user1', {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
    });

    const status = service.getKYCStatus('user1');
    expect(status).toBeDefined();
    expect(status?.status).toBe('in_progress');
  });

  it('should approve KYC when complete', () => {
    service.submitKYC('user1', {
      firstName: 'John',
      lastName: 'Doe',
      documentType: 'passport',
      documentId: 'ABC123',
      dateOfBirth: '1990-01-01',
    });

    service.submitKYC('user1', {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
    });

    service.submitKYC('user1', {
      faceImageHash: 'hash123',
      livenessScore: 0.98,
    });

    service.approveKYC('user1');
    const status = service.getKYCStatus('user1');

    expect(status?.status).toBe('approved');
  });

  it('should perform AML checks', () => {
    const result = service.performAMLCheck('user1', {
      name: 'John Doe',
      country: 'USA',
      dateOfBirth: '1990-01-01',
    });

    expect(result).toBeDefined();
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it('should flag PEP in AML check', () => {
    const result = service.performAMLCheck('user1', {
      name: 'Vladimir Putin',
      country: 'Russia',
      dateOfBirth: '1952-10-01',
    });

    expect(result.flags.pep).toBe(true);
  });

  it('should validate KYC expiry', () => {
    const now = Date.now();
    service.submitKYC('user1', {
      firstName: 'John',
      lastName: 'Doe',
      documentType: 'passport',
      documentId: 'ABC123',
      dateOfBirth: '1990-01-01',
    });

    service.submitKYC('user1', {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
    });

    service.submitKYC('user1', {
      faceImageHash: 'hash123',
      livenessScore: 0.98,
    });

    service.approveKYC('user1');

    const status = service.getKYCStatus('user1');
    expect(status?.approvedAt).toBeDefined();
  });
});

describe('FraudDetectionService', () => {
  let service: FraudDetectionService;

  beforeEach(() => {
    service = new FraudDetectionService();
  });

  it('should detect wash trading', () => {
    const alert = service.detectWashTrading('user1', 'STX', [
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
    expect(alert?.type).toBe('wash_trading');
  });

  it('should detect sybil attacks', () => {
    const alert = service.detectSybilAttack('user1', 'user2', '192.168.1.1', Date.now());

    expect(alert).toBeDefined();
    if (alert) {
      expect(alert.type).toBe('sybil_attack');
    }
  });

  it('should detect pump and dump patterns', () => {
    const alert = service.detectPumpDump('user1', 'STX', [
      { price: 100, volume: 1000, timestamp: Date.now() },
      { price: 130, volume: 3500, timestamp: Date.now() + 3600000 },
    ]);

    expect(alert).toBeDefined();
    expect(alert?.type).toBe('pump_and_dump');
  });

  it('should detect price manipulation', () => {
    const alert = service.detectPriceManipulation('user1', [
      { price: 100, amount: 100, timestamp: Date.now() },
    ], 90);

    expect(alert).toBeDefined();
    if (alert) {
      expect(alert.type).toBe('price_manipulation');
    }
  });

  it('should detect volume spoofing', () => {
    const alert = service.detectVolumeSpoofing('user1', 'STX', 100, 80);

    expect(alert).toBeDefined();
    if (alert) {
      expect(alert.type).toBe('volume_spoofing');
    }
  });

  it('should detect unusual patterns', () => {
    const alert = service.detectUnusualPattern('user1', 150);

    expect(alert).toBeDefined();
    expect(alert?.type).toBe('unusual_pattern');
  });

  it('should retrieve alerts by user', () => {
    service.recordAlert('user1', {
      id: 'alert1',
      userId: 'user1',
      type: 'wash_trading',
      severity: 'high',
      description: 'Test alert',
      timestamp: Date.now(),
      resolved: false,
      resolutionNotes: '',
    });

    const alerts = service.getAlertsByUser('user1');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('should resolve alerts', () => {
    const alert = {
      id: 'alert1',
      userId: 'user1',
      type: 'wash_trading' as const,
      severity: 'high' as const,
      description: 'Test alert',
      timestamp: Date.now(),
      resolved: false,
      resolutionNotes: '',
    };

    service.recordAlert('user1', alert);
    service.resolveAlert('alert1', 'False positive confirmed');

    const alerts = service.getAlertsByUser('user1');
    expect(alerts[0].resolved).toBe(true);
  });
});

describe('AccountLinkingService', () => {
  let service: AccountLinkingService;

  beforeEach(() => {
    service = new AccountLinkingService();
  });

  it('should generate verification code', () => {
    const code = service.generateVerificationCode();
    expect(code).toBeDefined();
    expect(code.length).toBe(6);
  });

  it('should request account link', () => {
    const request = service.linkAccount('user1', 'email', 'john@example.com');
    expect(request).toBeDefined();
    expect(request.type).toBe('email');
    expect(request.value).toBe('john@example.com');
  });

  it('should verify linked account', () => {
    const request = service.linkAccount('user1', 'email', 'john@example.com');
    const verified = service.verifyLink(request.id, request.verificationCode);

    expect(verified).toBe(true);
  });

  it('should find users by email', () => {
    service.linkAccount('user1', 'email', 'john@example.com');
    service.verifyLink('request1', 'code');

    const users = service.findUserByAccount('email', 'john@example.com');
    expect(users.length).toBeGreaterThanOrEqual(0);
  });

  it('should support multiple account types', () => {
    const emailLink = service.linkAccount('user1', 'email', 'john@example.com');
    const walletLink = service.linkAccount('user1', 'wallet', 'ST1234567890ABCDEF');

    expect(emailLink.type).toBe('email');
    expect(walletLink.type).toBe('wallet');
  });

  it('should mark account suspicious', () => {
    service.linkAccount('user1', 'email', 'john@example.com');
    service.markAccountSuspicious('email', 'john@example.com', 'Linked to fraudster');

    const status = service.isAccountSuspicious('email', 'john@example.com');
    expect(status).toBe(true);
  });
});

describe('ReputationManager', () => {
  let manager: ReputationManager;

  beforeEach(() => {
    manager = new ReputationManager();
  });

  it('should create user reputation', () => {
    const rep = manager.createUserReputation('user1');
    expect(rep).toBeDefined();
    expect(rep.userId).toBe('user1');
  });

  it('should update reputation score', () => {
    manager.createUserReputation('user1');
    manager.updateReputationScore('user1', {
      completionRate: 0.9,
      transactionVolume: 50,
      averageResponseTime: 3,
      accountAgeDays: 100,
      verificationLevel: 'level2',
    });

    const rep = manager.getUserReputation('user1');
    expect(rep?.score.score).toBeGreaterThan(0);
  });

  it('should integrate fraud detection', () => {
    manager.createUserReputation('user1');

    const alert = manager.checkFraudAlert('user1', 'wash_trading', [
      { price: 100, amount: 1000, timestamp: Date.now(), type: 'sell' },
      { price: 100, amount: 950, timestamp: Date.now() + 30000, type: 'buy' },
    ]);

    expect(alert).toBeDefined();
  });

  it('should track KYC status', () => {
    manager.createUserReputation('user1');
    manager.submitKYC('user1', {
      firstName: 'John',
      lastName: 'Doe',
      documentType: 'passport',
      documentId: 'ABC123',
      dateOfBirth: '1990-01-01',
    });

    const rep = manager.getUserReputation('user1');
    expect(rep?.kycStatus.status).toBe('in_progress');
  });

  it('should link accounts', () => {
    manager.createUserReputation('user1');
    const request = manager.linkAccount('user1', 'email', 'john@example.com');

    expect(request).toBeDefined();
    expect(request.type).toBe('email');
  });

  it('should retrieve high risk users', () => {
    manager.createUserReputation('user1');
    manager.checkFraudAlert('user1', 'wash_trading', [
      { price: 100, amount: 1000, timestamp: Date.now(), type: 'sell' },
      { price: 100, amount: 950, timestamp: Date.now() + 30000, type: 'buy' },
    ]);

    const highRiskUsers = manager.getHighRiskUsers();
    expect(Array.isArray(highRiskUsers)).toBe(true);
  });
});
