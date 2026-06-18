/**
 * Leaderboard Service
 * 
 * Manages leaderboard rankings and user statistics
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  walletAddress: string;
  predictions: number;
  winRate: number;
  totalStaked: number;
  totalWinnings: number;
  totalLosses: number;
  netPnL: number;
  lastActive: number;
}

export interface LeaderboardStats {
  totalEntries: number;
  topEntry: LeaderboardEntry | null;
  averageWinRate: number;
  averageStaked: number;
  medianNetPnL: number;
}

export type LeaderboardSortBy = 'winRate' | 'netPnL' | 'predictions' | 'totalStaked' | 'lastActive';

export class LeaderboardService {
  private entries: Map<string, LeaderboardEntry> = new Map();
  private sortBy: LeaderboardSortBy = 'winRate';

  /**
   * Add or update a leaderboard entry
   */
  addEntry(entry: Omit<LeaderboardEntry, 'rank'>): void {
    this.entries.set(entry.userId, {
      ...entry,
      rank: 0, // Will be recalculated
    });
    this.recalculateRanks();
  }

  /**
   * Get leaderboard entries sorted by criteria
   */
  getLeaderboard(
    sortBy: LeaderboardSortBy = this.sortBy,
    limit: number = 100,
    offset: number = 0
  ): LeaderboardEntry[] {
    const sorted = Array.from(this.entries.values()).sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          return b.winRate - a.winRate;
        case 'netPnL':
          return b.netPnL - a.netPnL;
        case 'predictions':
          return b.predictions - a.predictions;
        case 'totalStaked':
          return b.totalStaked - a.totalStaked;
        case 'lastActive':
          return b.lastActive - a.lastActive;
        default:
          return 0;
      }
    });

    return sorted.slice(offset, offset + limit).map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }));
  }

  /**
   * Get user's rank and position
   */
  getUserRank(userId: string, sortBy: LeaderboardSortBy = this.sortBy): LeaderboardEntry | null {
    const leaderboard = this.getLeaderboard(sortBy, this.entries.size);
    return leaderboard.find((entry) => entry.userId === userId) || null;
  }

  /**
   * Get top N entries
   */
  getTopEntries(count: number = 10, sortBy: LeaderboardSortBy = this.sortBy): LeaderboardEntry[] {
    return this.getLeaderboard(sortBy, count);
  }

  /**
   * Get entries around a user (user + N above and below)
   */
  getEntriesAround(userId: string, range: number = 5, sortBy: LeaderboardSortBy = this.sortBy): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard(sortBy, this.entries.size);
    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);

    if (userIndex === -1) return [];

    const start = Math.max(0, userIndex - range);
    const end = Math.min(leaderboard.length, userIndex + range + 1);

    return leaderboard.slice(start, end);
  }

  /**
   * Get leaderboard statistics
   */
  getStats(sortBy: LeaderboardSortBy = this.sortBy): LeaderboardStats {
    const entries = this.getLeaderboard(sortBy, this.entries.size);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        topEntry: null,
        averageWinRate: 0,
        averageStaked: 0,
        medianNetPnL: 0,
      };
    }

    const winRates = entries.map((e) => e.winRate);
    const staked = entries.map((e) => e.totalStaked);
    const pnls = entries.map((e) => e.netPnL).sort((a, b) => a - b);

    return {
      totalEntries: entries.length,
      topEntry: entries[0],
      averageWinRate: winRates.reduce((a, b) => a + b, 0) / winRates.length,
      averageStaked: staked.reduce((a, b) => a + b, 0) / staked.length,
      medianNetPnL: pnls[Math.floor(pnls.length / 2)],
    };
  }

  /**
   * Get percentile rank for a user
   */
  getPercentileRank(userId: string, sortBy: LeaderboardSortBy = this.sortBy): number {
    const leaderboard = this.getLeaderboard(sortBy, this.entries.size);
    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);

    if (userIndex === -1) return 0;

    return ((leaderboard.length - userIndex) / leaderboard.length) * 100;
  }

  /**
   * Get user's performance metrics
   */
  getUserMetrics(userId: string): {
    rank: number;
    percentile: number;
    predictions: number;
    winRate: number;
    totalStaked: number;
    netPnL: number;
    comparisonToAverage: {
      winRate: number;
      netPnL: number;
      predictions: number;
    };
  } | null {
    const entry = this.getUserRank(userId);
    if (!entry) return null;

    const stats = this.getStats();

    return {
      rank: entry.rank,
      percentile: this.getPercentileRank(userId),
      predictions: entry.predictions,
      winRate: entry.winRate,
      totalStaked: entry.totalStaked,
      netPnL: entry.netPnL,
      comparisonToAverage: {
        winRate: entry.winRate - stats.averageWinRate,
        netPnL: entry.netPnL - stats.medianNetPnL,
        predictions: entry.predictions - Math.floor(stats.totalEntries / 2),
      },
    };
  }

  /**
   * Recalculate all ranks
   */
  private recalculateRanks(): void {
    const sorted = Array.from(this.entries.values()).sort((a, b) => b.winRate - a.winRate);

    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  /**
   * Get entries by category/filter
   */
  getEntriesByFilter(
    filter: (entry: LeaderboardEntry) => boolean,
    sortBy: LeaderboardSortBy = this.sortBy,
    limit: number = 100
  ): LeaderboardEntry[] {
    const filtered = Array.from(this.entries.values())
      .filter(filter)
      .sort((a, b) => {
        switch (sortBy) {
          case 'winRate':
            return b.winRate - a.winRate;
          case 'netPnL':
            return b.netPnL - a.netPnL;
          case 'predictions':
            return b.predictions - a.predictions;
          case 'totalStaked':
            return b.totalStaked - a.totalStaked;
          case 'lastActive':
            return b.lastActive - a.lastActive;
          default:
            return 0;
        }
      });

    return filtered.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  /**
   * Get trending users (recently active)
   */
  getTrendingUsers(limit: number = 10): LeaderboardEntry[] {
    return this.getEntriesByFilter(
      (entry) => Date.now() - entry.lastActive < 24 * 60 * 60 * 1000, // Last 24 hours
      'lastActive',
      limit
    );
  }

  /**
   * Get rising stars (high win rate, few predictions)
   */
  getRisingStars(limit: number = 10): LeaderboardEntry[] {
    return this.getEntriesByFilter(
      (entry) => entry.predictions >= 5 && entry.predictions <= 50 && entry.winRate > 60,
      'winRate',
      limit
    );
  }

  /**
   * Get consistent performers (many predictions, high win rate)
   */
  getConsistentPerformers(limit: number = 10): LeaderboardEntry[] {
    return this.getEntriesByFilter(
      (entry) => entry.predictions >= 50 && entry.winRate > 55,
      'predictions',
      limit
    );
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries.clear();
  }

  /**
   * Get total number of entries
   */
  getSize(): number {
    return this.entries.size;
  }
}

// Singleton instance
let leaderboardInstance: LeaderboardService | null = null;

export function getLeaderboardService(): LeaderboardService {
  if (!leaderboardInstance) {
    leaderboardInstance = new LeaderboardService();
  }
  return leaderboardInstance;
}
