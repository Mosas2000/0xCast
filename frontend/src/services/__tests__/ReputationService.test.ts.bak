import { describe, it, expect, beforeEach } from 'vitest';
import { ReputationService } from '../ReputationService';

describe('ReputationService', () => {
  let service: ReputationService;

  beforeEach(() => {
    service = new ReputationService();
  });

  describe('calculateReputationScore', () => {
    it('should calculate score based on metrics', () => {
      const score = service.calculateReputationScore('user1', {
        totalTransactions: 50,
        successfulTransactions: 45,
        failedTransactions: 5,
        averageResponseTime: 3000,
        accountAge: 86400000 * 60,
        verificationLevel: 3,
        suspiciousActivityCount: 0,
      });

      expect(score.score).toBeGreaterThan(0);
      expect(score.userId).toBe('user1');
      expect(score.totalTransactions).toBe(50);
      expect(score.successfulTransactions).toBe(45);
    });

    it('should determine correct reputation level', () => {
      const eliteScore = service.calculateReputationScore('user1', {
        totalTransactions: 100,
        successfulTransactions: 100,
        failedTransactions: 0,
        averageResponseTime: 1000,
        accountAge: 86400000 * 365,
        verificationLevel: 3,
        suspiciousActivityCount: 0,
      });

      expect(eliteScore.level).toBe('elite');
    });

    it('should penalize failed transactions', () => {
      const goodScore = service.calculateReputationScore('user1', {
        totalTransactions: 50,
        successfulTransactions: 50,
        failedTransactions: 0,
        averageResponseTime: 3000,
        accountAge: 86400000 * 30,
        verificationLevel: 2,
        suspiciousActivityCount: 0,
      });

      const badScore = service.calculateReputationScore('user2', {
        totalTransactions: 50,
        successfulTransactions: 25,
        failedTransactions: 25,
        averageResponseTime: 3000,
        accountAge: 86400000 * 30,
        verificationLevel: 2,
        suspiciousActivityCount: 0,
      });

      expect(goodScore.score).toBeGreaterThan(badScore.score);
    });

    it('should penalize suspicious activities', () => {
      const cleanScore = service.calculateReputationScore('user1', {
        totalTransactions: 50,
        successfulTransactions: 45,
        failedTransactions: 5,
        averageResponseTime: 3000,
        accountAge: 86400000 * 30,
        verificationLevel: 2,
        suspiciousActivityCount: 0,
      });

      const suspiciousScore = service.calculateReputationScore('user2', {
        totalTransactions: 50,
        successfulTransactions: 45,
        failedTransactions: 5,
        averageResponseTime: 3000,
        accountAge: 86400000 * 30,
        verificationLevel: 2,
        suspiciousActivityCount: 5,
      });

      expect(cleanScore.score).toBeGreaterThan(suspiciousScore.score);
    });
  });

  describe('adjustReputation', () => {
    it('should adjust reputation score', () => {
      const reputation = service.initializeReputation('user1');
      
      service.adjustReputation('user1', 100, 'Good behavior', 'admin');
      
      const updated = service.getReputation('user1');
      expect(updated?.reputationScore.score).toBe(100);
    });

    it('should not allow score below 0', () => {
      const reputation = service.initializeReputation('user1');
      
      service.adjustReputation('user1', -500, 'Penalty', 'admin');
      
      const updated = service.getReputation('user1');
      expect(updated?.reputationScore.score).toBe(0);
    });

    it('should not allow score above 1000', () => {
      const reputation = service.initializeReputation('user1');
      
      service.adjustReputation('user1', 2000, 'Bonus', 'admin');
      
      const updated = service.getReputation('user1');
      expect(updated?.reputationScore.score).toBe(1000);
    });

    it('should track adjustment history', () => {
      service.initializeReputation('user1');
      
      service.adjustReputation('user1', 50, 'Reason 1', 'admin');
      service.adjustReputation('user1', -20, 'Reason 2', 'admin');
      
      const history = service.getAdjustmentHistory('user1');
      expect(history).toHaveLength(2);
      expect(history[0].amount).toBe(50);
      expect(history[1].amount).toBe(-20);
    });
  });

  describe('badge system', () => {
    it('should award badges', () => {
      service.initializeReputation('user1');
      
      service.awardBadge('user1', {
        badgeId: 'test_badge',
        name: 'Test Badge',
        description: 'Test',
        icon: '🏆',
        requirement: 'Test requirement',
      });
      
      const badges = service.getUserBadges('user1');
      expect(badges).toHaveLength(1);
      expect(badges[0].badgeId).toBe('test_badge');
    });

    it('should not award duplicate badges', () => {
      service.initializeReputation('user1');
      
      const badge = {
        badgeId: 'test_badge',
        name: 'Test Badge',
        description: 'Test',
        icon: '🏆',
        requirement: 'Test requirement',
      };
      
      service.awardBadge('user1', badge);
      service.awardBadge('user1', badge);
      
      const badges = service.getUserBadges('user1');
      expect(badges).toHaveLength(1);
    });

    it('should check badge eligibility', () => {
      const reputation = service.initializeReputation('user1');
      
      reputation.reputationScore.totalTransactions = 10;
      reputation.reputationScore.completionRate = 0.95;
      
      const eligible = service.checkBadgeEligibility('user1');
      expect(eligible.length).toBeGreaterThan(0);
    });
  });

  describe('leaderboard', () => {
    it('should return top users by score', () => {
      service.initializeReputation('user1');
      service.initializeReputation('user2');
      service.initializeReputation('user3');
      
      service.adjustReputation('user1', 500, 'Test', 'admin');
      service.adjustReputation('user2', 300, 'Test', 'admin');
      service.adjustReputation('user3', 700, 'Test', 'admin');
      
      const leaderboard = service.getLeaderboard(3);
      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].userId).toBe('user3');
      expect(leaderboard[1].userId).toBe('user1');
      expect(leaderboard[2].userId).toBe('user2');
    });

    it('should limit leaderboard size', () => {
      for (let i = 0; i < 20; i++) {
        service.initializeReputation(`user${i}`);
      }
      
      const leaderboard = service.getLeaderboard(5);
      expect(leaderboard).toHaveLength(5);
    });
  });

  describe('reputation stats', () => {
    it('should calculate correct statistics', () => {
      service.initializeReputation('user1');
      service.initializeReputation('user2');
      service.initializeReputation('user3');
      
      service.adjustReputation('user1', 300, 'Test', 'admin');
      service.adjustReputation('user2', 600, 'Test', 'admin');
      service.adjustReputation('user3', 900, 'Test', 'admin');
      
      const stats = service.getReputationStats();
      expect(stats.totalUsers).toBe(3);
      expect(stats.averageScore).toBeGreaterThan(0);
      expect(stats.levelDistribution).toBeDefined();
    });
  });

  describe('initialization', () => {
    it('should initialize new user reputation', () => {
      const reputation = service.initializeReputation('user1');
      
      expect(reputation.userId).toBe('user1');
      expect(reputation.reputationScore.score).toBe(0);
      expect(reputation.reputationScore.level).toBe('new');
      expect(reputation.verificationStatus).toBe('unverified');
    });
  });

  describe('export', () => {
    it('should export reputation data', () => {
      service.initializeReputation('user1');
      service.adjustReputation('user1', 100, 'Test', 'admin');
      
      const exported = service.exportReputationData('user1');
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.reputation).toBeDefined();
      expect(parsed.adjustments).toBeDefined();
      expect(parsed.badges).toBeDefined();
    });
  });
});
