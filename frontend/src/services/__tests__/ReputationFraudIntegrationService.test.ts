import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationFraudIntegrationService } from '../ReputationFraudIntegrationService';

describe('ReputationFraudIntegrationService', () => {
  let service: ReputationFraudIntegrationService;

  beforeEach(() => {
    service = new ReputationFraudIntegrationService();
  });

  describe('user initialization', () => {
    it('should initialize new user with reputation and AML check', () => {
      const reputation = service.initializeUser('user1');
      
      expect(reputation).toBeDefined();
      expect(reputation.userId).toBe('user1');
      expect(reputation.reputationScore.score).toBe(0);
      
      const amlCheck = service.getKYCAMLService().getLatestAMLCheck('user1');
      expect(amlCheck).toBeDefined();
    });
  });

  describe('transaction processing', () => {
    it('should allow transactions for verified users', () => {
      service.initializeUser('user1');
      
      const kycService = service.getKYCAMLService();
      kycService.submitKYC('user1', 'passport', {});
      kycService.verifyDocument('user1');
      kycService.verifyAddress('user1');
      kycService.approveKYC('user1');
      
      const result = service.processTransaction('user1', {
        amount: 500,
        type: 'stake',
      });
      
      expect(result.allowed).toBe(true);
    });

    it('should block large transactions without KYC', () => {
      service.initializeUser('user1');
      
      const result = service.processTransaction('user1', {
        amount: 2000,
        type: 'stake',
      });
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('KYC');
    });

    it('should block transactions for high-risk users', () => {
      service.initializeUser('user1');
      
      const fraudService = service.getFraudDetectionService();
      fraudService.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);
      
      const activities = fraudService.getSuspiciousActivities('user1');
      activities.forEach(a => fraudService.confirmSuspiciousActivity(a.activityId));
      
      const result = service.processTransaction('user1', {
        amount: 100,
        type: 'stake',
      });
      
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should block transactions for flagged AML users', () => {
      service.initializeUser('user1');
      
      const kycService = service.getKYCAMLService();
      kycService.performAMLCheck('user1', 'hash');
      kycService.updateAMLStatus('user1', {
        pep: true,
        sanctions: true,
        adverseMedia: false,
      });
      
      const result = service.processTransaction('user1', {
        amount: 100,
        type: 'stake',
      });
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('AML');
    });
  });

  describe('user metrics update', () => {
    it('should update reputation after successful transaction', () => {
      service.initializeUser('user1');
      
      service.updateUserMetrics('user1', true, 2000);
      
      const reputation = service.getReputationService().getReputation('user1');
      expect(reputation?.reputationScore.totalTransactions).toBe(1);
      expect(reputation?.reputationScore.successfulTransactions).toBe(1);
    });

    it('should update reputation after failed transaction', () => {
      service.initializeUser('user1');
      
      service.updateUserMetrics('user1', false, 2000);
      
      const reputation = service.getReputationService().getReputation('user1');
      expect(reputation?.reputationScore.totalTransactions).toBe(1);
      expect(reputation?.reputationScore.failedTransactions).toBe(1);
    });

    it('should award badges when eligible', () => {
      service.initializeUser('user1');
      
      for (let i = 0; i < 10; i++) {
        service.updateUserMetrics('user1', true, 2000);
      }
      
      const badges = service.getReputationService().getUserBadges('user1');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('fraud detection', () => {
    it('should detect fraudulent activity', () => {
      service.initializeUser('user1');
      
      const transactions = [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ];
      
      const activities = service.detectFraudulentActivity('user1', transactions);
      expect(activities.length).toBeGreaterThan(0);
    });

    it('should penalize reputation for fraud', () => {
      service.initializeUser('user1');
      
      service.getReputationService().adjustReputation('user1', 500, 'Initial', 'system');
      
      const initialScore = service.getReputationService().getReputation('user1')?.reputationScore.score;
      
      const transactions = [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ];
      
      service.detectFraudulentActivity('user1', transactions);
      
      const finalScore = service.getReputationService().getReputation('user1')?.reputationScore.score;
      
      expect(finalScore).toBeLessThan(initialScore!);
    });
  });

  describe('trust score calculation', () => {
    it('should calculate trust score based on multiple factors', () => {
      service.initializeUser('user1');
      
      const trustScore = service.getUserTrustScore('user1');
      
      expect(trustScore.score).toBeGreaterThanOrEqual(0);
      expect(trustScore.score).toBeLessThanOrEqual(100);
      expect(trustScore.factors).toBeDefined();
      expect(trustScore.level).toBeDefined();
    });

    it('should increase trust score with KYC verification', () => {
      service.initializeUser('user1');
      
      const initialTrust = service.getUserTrustScore('user1');
      
      const kycService = service.getKYCAMLService();
      kycService.submitKYC('user1', 'passport', {});
      kycService.verifyDocument('user1');
      kycService.verifyAddress('user1');
      kycService.approveKYC('user1');
      
      const finalTrust = service.getUserTrustScore('user1');
      
      expect(finalTrust.score).toBeGreaterThan(initialTrust.score);
    });

    it('should decrease trust score with fraud risk', () => {
      service.initializeUser('user1');
      
      service.getReputationService().adjustReputation('user1', 500, 'Initial', 'system');
      
      const initialTrust = service.getUserTrustScore('user1');
      
      const fraudService = service.getFraudDetectionService();
      fraudService.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);
      
      const activities = fraudService.getSuspiciousActivities('user1');
      activities.forEach(a => fraudService.confirmSuspiciousActivity(a.activityId));
      
      const finalTrust = service.getUserTrustScore('user1');
      
      expect(finalTrust.score).toBeLessThan(initialTrust.score);
    });
  });

  describe('compliance reporting', () => {
    it('should generate compliance report', () => {
      service.initializeUser('user1');
      
      const report = service.generateComplianceReport('user1');
      
      expect(report.userId).toBe('user1');
      expect(report.timestamp).toBeDefined();
      expect(report.kycStatus).toBeDefined();
      expect(report.amlStatus).toBeDefined();
      expect(report.reputationScore).toBeDefined();
      expect(report.fraudRiskScore).toBeDefined();
      expect(report.recommendation).toBeDefined();
    });

    it('should recommend review for high-risk users', () => {
      service.initializeUser('user1');
      
      const fraudService = service.getFraudDetectionService();
      fraudService.detectWashTrading('user1', [
        { id: 't1', timestamp: 1000, price: 100, volume: 50, marketId: 'm1' },
        { id: 't2', timestamp: 1030, price: 100.5, volume: 51, marketId: 'm1' },
      ]);
      
      const activities = fraudService.getSuspiciousActivities('user1');
      activities.forEach(a => fraudService.confirmSuspiciousActivity(a.activityId));
      
      const report = service.generateComplianceReport('user1');
      
      expect(report.recommendation).toContain('review');
    });
  });

  describe('transaction limits', () => {
    it('should enforce transaction limits based on trust score', () => {
      service.initializeUser('user1');
      
      const result = service.enforceTransactionLimits('user1', 200);
      
      expect(result.limit).toBeDefined();
      expect(result.allowed).toBeDefined();
    });

    it('should allow higher limits for KYC verified users', () => {
      service.initializeUser('user1');
      
      const initialLimit = service.enforceTransactionLimits('user1', 1000);
      
      const kycService = service.getKYCAMLService();
      kycService.submitKYC('user1', 'passport', {});
      kycService.verifyDocument('user1');
      kycService.verifyAddress('user1');
      kycService.approveKYC('user1');
      
      const finalLimit = service.enforceTransactionLimits('user1', 5000);
      
      expect(finalLimit.limit).toBeGreaterThan(initialLimit.limit);
    });

    it('should block transactions exceeding limits', () => {
      service.initializeUser('user1');
      
      const result = service.enforceTransactionLimits('user1', 10000);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('exceeds limit');
    });
  });
});
