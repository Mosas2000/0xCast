import { describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardService, type LeaderboardEntry } from '../LeaderboardService';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  const mockEntries = [
    {
      userId: 'user_1',
      username: 'TopTrader',
      walletAddress: 'ST1',
      predictions: 100,
      winRate: 75,
      totalStaked: 50000,
      totalWinnings: 37500,
      totalLosses: 12500,
      netPnL: 25000,
      lastActive: Date.now(),
    },
    {
      userId: 'user_2',
      username: 'GoodTrader',
      walletAddress: 'ST2',
      predictions: 80,
      winRate: 65,
      totalStaked: 40000,
      totalWinnings: 26000,
      totalLosses: 14000,
      netPnL: 12000,
      lastActive: Date.now() - 1000,
    },
    {
      userId: 'user_3',
      username: 'NewTrader',
      walletAddress: 'ST3',
      predictions: 20,
      winRate: 70,
      totalStaked: 10000,
      totalWinnings: 7000,
      totalLosses: 3000,
      netPnL: 4000,
      lastActive: Date.now() - 2000,
    },
  ];

  beforeEach(() => {
    service = new LeaderboardService();
    mockEntries.forEach((entry) => service.addEntry(entry));
  });

  describe('entry management', () => {
    it('adds entries to leaderboard', () => {
      expect(service.getSize()).toBe(3);
    });

    it('updates existing entries', () => {
      service.addEntry({
        ...mockEntries[0],
        winRate: 80,
      });

      const entry = service.getUserRank('user_1');
      expect(entry?.winRate).toBe(80);
    });

    it('clears all entries', () => {
      service.clear();
      expect(service.getSize()).toBe(0);
    });
  });

  describe('leaderboard retrieval', () => {
    it('returns leaderboard sorted by win rate', () => {
      const leaderboard = service.getLeaderboard('winRate');
      expect(leaderboard[0].userId).toBe('user_1');
      expect(leaderboard[1].userId).toBe('user_3');
      expect(leaderboard[2].userId).toBe('user_2');
    });

    it('returns leaderboard sorted by net P&L', () => {
      const leaderboard = service.getLeaderboard('netPnL');
      expect(leaderboard[0].userId).toBe('user_1');
      expect(leaderboard[1].userId).toBe('user_2');
      expect(leaderboard[2].userId).toBe('user_3');
    });

    it('returns leaderboard sorted by predictions', () => {
      const leaderboard = service.getLeaderboard('predictions');
      expect(leaderboard[0].userId).toBe('user_1');
      expect(leaderboard[1].userId).toBe('user_2');
      expect(leaderboard[2].userId).toBe('user_3');
    });

    it('respects limit parameter', () => {
      const leaderboard = service.getLeaderboard('winRate', 2);
      expect(leaderboard).toHaveLength(2);
    });

    it('respects offset parameter', () => {
      const leaderboard = service.getLeaderboard('winRate', 2, 1);
      expect(leaderboard[0].userId).toBe('user_3');
    });
  });

  describe('user ranking', () => {
    it('gets user rank', () => {
      const rank = service.getUserRank('user_1');
      expect(rank?.rank).toBe(1);
      expect(rank?.userId).toBe('user_1');
    });

    it('returns null for non-existent user', () => {
      const rank = service.getUserRank('non_existent');
      expect(rank).toBeNull();
    });

    it('gets top entries', () => {
      const top = service.getTopEntries(2);
      expect(top).toHaveLength(2);
      expect(top[0].rank).toBe(1);
      expect(top[1].rank).toBe(2);
    });

    it('gets entries around user', () => {
      const entries = service.getEntriesAround('user_2', 1);
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.some((e) => e.userId === 'user_2')).toBe(true);
    });
  });

  describe('statistics', () => {
    it('calculates leaderboard stats', () => {
      const stats = service.getStats();
      expect(stats.totalEntries).toBe(3);
      expect(stats.topEntry?.userId).toBe('user_1');
      expect(stats.averageWinRate).toBeGreaterThan(0);
      expect(stats.averageStaked).toBeGreaterThan(0);
    });

    it('calculates percentile rank', () => {
      const percentile = service.getPercentileRank('user_1');
      expect(percentile).toBeGreaterThan(0);
      expect(percentile).toBeLessThanOrEqual(100);
    });

    it('gets user metrics', () => {
      const metrics = service.getUserMetrics('user_1');
      expect(metrics).not.toBeNull();
      expect(metrics?.rank).toBe(1);
      expect(metrics?.percentile).toBeGreaterThan(0);
      expect(metrics?.comparisonToAverage).toBeDefined();
    });
  });

  describe('filtering', () => {
    it('filters entries by criteria', () => {
      const filtered = service.getEntriesByFilter(
        (entry) => entry.predictions > 50,
        'predictions'
      );
      expect(filtered.length).toBe(2);
    });

    it('gets trending users', () => {
      const trending = service.getTrendingUsers(10);
      expect(trending.length).toBeGreaterThan(0);
    });

    it('gets rising stars', () => {
      const risingStars = service.getRisingStars(10);
      // Should include user_3 (20 predictions, 70% win rate)
      expect(risingStars.some((e) => e.userId === 'user_3')).toBe(true);
    });

    it('gets consistent performers', () => {
      const consistent = service.getConsistentPerformers(10);
      // Should include user_1 and user_2 (>50 predictions, >55% win rate)
      expect(consistent.some((e) => e.userId === 'user_1')).toBe(true);
    });
  });

  describe('ranking calculations', () => {
    it('assigns correct ranks', () => {
      const leaderboard = service.getLeaderboard('winRate');
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[2].rank).toBe(3);
    });

    it('updates ranks after adding entry', () => {
      service.addEntry({
        userId: 'user_4',
        username: 'BestTrader',
        walletAddress: 'ST4',
        predictions: 150,
        winRate: 85,
        totalStaked: 60000,
        totalWinnings: 51000,
        totalLosses: 9000,
        netPnL: 42000,
        lastActive: Date.now(),
      });

      const rank = service.getUserRank('user_4');
      expect(rank?.rank).toBe(1);
    });
  });
});
