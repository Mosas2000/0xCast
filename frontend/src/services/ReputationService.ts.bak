import {
  ReputationScore,
  ReputationLevel,
  UserReputation,
  ReputationAdjustment,
  ReputationBadge,
} from '@/types/reputation';

export class ReputationService {
  private reputations: Map<string, UserReputation> = new Map();
  private adjustments: Map<string, ReputationAdjustment[]> = new Map();
  private badges: Map<string, ReputationBadge[]> = new Map();

  calculateReputationScore(userId: string, metrics: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageResponseTime: number;
    accountAge: number;
    verificationLevel: number;
    suspiciousActivityCount: number;
  }): ReputationScore {
    const completionRate = metrics.totalTransactions > 0
      ? metrics.successfulTransactions / metrics.totalTransactions
      : 0;

    let baseScore = 0;

    baseScore += Math.min(metrics.successfulTransactions * 2, 200);
    baseScore += completionRate * 100;
    baseScore += Math.min(metrics.accountAge / (86400000 * 30), 50);
    baseScore += metrics.verificationLevel * 50;

    baseScore -= metrics.failedTransactions * 5;
    baseScore -= metrics.suspiciousActivityCount * 20;
    baseScore -= Math.max(0, (metrics.averageResponseTime - 5000) / 1000);

    const finalScore = Math.max(0, Math.min(1000, baseScore));

    const level = this.determineReputationLevel(finalScore);

    const existingReputation = this.reputations.get(userId);
    const existingBadges = existingReputation?.reputationScore.badges || [];

    return {
      userId,
      score: Math.round(finalScore),
      level,
      totalTransactions: metrics.totalTransactions,
      successfulTransactions: metrics.successfulTransactions,
      failedTransactions: metrics.failedTransactions,
      averageResponseTime: metrics.averageResponseTime,
      completionRate,
      lastUpdated: Date.now(),
      badges: existingBadges,
    };
  }

  private determineReputationLevel(score: number): ReputationLevel {
    if (score >= 750) return 'elite';
    if (score >= 500) return 'verified';
    if (score >= 250) return 'trusted';
    return 'new';
  }

  updateReputation(userId: string, reputationScore: ReputationScore): void {
    const existing = this.reputations.get(userId);

    if (existing) {
      existing.reputationScore = reputationScore;
      existing.updatedAt = Date.now();
      this.reputations.set(userId, existing);
    }
  }

  getReputation(userId: string): UserReputation | undefined {
    return this.reputations.get(userId);
  }

  adjustReputation(
    userId: string,
    amount: number,
    reason: string,
    appliedBy: string
  ): ReputationAdjustment {
    const adjustment: ReputationAdjustment = {
      adjustmentId: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount,
      reason,
      timestamp: Date.now(),
      appliedBy,
    };

    const userAdjustments = this.adjustments.get(userId) || [];
    userAdjustments.push(adjustment);
    this.adjustments.set(userId, userAdjustments);

    const reputation = this.reputations.get(userId);
    if (reputation) {
      reputation.reputationScore.score = Math.max(
        0,
        Math.min(1000, reputation.reputationScore.score + amount)
      );
      reputation.reputationScore.level = this.determineReputationLevel(
        reputation.reputationScore.score
      );
      reputation.updatedAt = Date.now();
      this.reputations.set(userId, reputation);
    }

    return adjustment;
  }

  getAdjustmentHistory(userId: string): ReputationAdjustment[] {
    return this.adjustments.get(userId) || [];
  }

  awardBadge(userId: string, badge: ReputationBadge): void {
    const userBadges = this.badges.get(userId) || [];

    if (!userBadges.find(b => b.badgeId === badge.badgeId)) {
      badge.earnedAt = Date.now();
      userBadges.push(badge);
      this.badges.set(userId, userBadges);

      const reputation = this.reputations.get(userId);
      if (reputation) {
        reputation.reputationScore.badges.push(badge.badgeId);
        this.reputations.set(userId, reputation);
      }
    }
  }

  getUserBadges(userId: string): ReputationBadge[] {
    return this.badges.get(userId) || [];
  }

  checkBadgeEligibility(userId: string): ReputationBadge[] {
    const reputation = this.reputations.get(userId);
    if (!reputation) return [];

    const eligibleBadges: ReputationBadge[] = [];
    const score = reputation.reputationScore;

    if (score.totalTransactions >= 10 && !score.badges.includes('first_trader')) {
      eligibleBadges.push({
        badgeId: 'first_trader',
        name: 'First Trader',
        description: 'Completed 10 transactions',
        icon: '🎯',
        requirement: '10 transactions',
      });
    }

    if (score.completionRate >= 0.95 && score.totalTransactions >= 20 && !score.badges.includes('reliable')) {
      eligibleBadges.push({
        badgeId: 'reliable',
        name: 'Reliable',
        description: '95% completion rate with 20+ transactions',
        icon: '⭐',
        requirement: '95% completion rate',
      });
    }

    if (score.level === 'elite' && !score.badges.includes('elite_trader')) {
      eligibleBadges.push({
        badgeId: 'elite_trader',
        name: 'Elite Trader',
        description: 'Reached elite reputation level',
        icon: '👑',
        requirement: 'Elite level',
      });
    }

    if (score.totalTransactions >= 100 && !score.badges.includes('veteran')) {
      eligibleBadges.push({
        badgeId: 'veteran',
        name: 'Veteran',
        description: 'Completed 100 transactions',
        icon: '🏆',
        requirement: '100 transactions',
      });
    }

    return eligibleBadges;
  }

  getLeaderboard(limit: number = 10): UserReputation[] {
    return Array.from(this.reputations.values())
      .sort((a, b) => b.reputationScore.score - a.reputationScore.score)
      .slice(0, limit);
  }

  getReputationStats(): {
    totalUsers: number;
    averageScore: number;
    levelDistribution: Record<ReputationLevel, number>;
  } {
    const reputations = Array.from(this.reputations.values());
    const totalUsers = reputations.length;

    const averageScore = totalUsers > 0
      ? reputations.reduce((sum, r) => sum + r.reputationScore.score, 0) / totalUsers
      : 0;

    const levelDistribution: Record<ReputationLevel, number> = {
      new: 0,
      trusted: 0,
      verified: 0,
      elite: 0,
    };

    reputations.forEach(r => {
      levelDistribution[r.reputationScore.level]++;
    });

    return {
      totalUsers,
      averageScore: Math.round(averageScore),
      levelDistribution,
    };
  }

  initializeReputation(userId: string): UserReputation {
    const reputation: UserReputation = {
      userId,
      reputationScore: {
        userId,
        score: 0,
        level: 'new',
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        averageResponseTime: 0,
        completionRate: 0,
        lastUpdated: Date.now(),
        badges: [],
      },
      verificationStatus: 'unverified',
      accountLinks: [],
      suspiciousActivities: [],
      kycStatus: {
        status: 'not_started',
        documentType: 'passport',
        documentVerified: false,
        addressVerified: false,
        faceVerified: false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.reputations.set(userId, reputation);
    return reputation;
  }

  exportReputationData(userId: string): string {
    const reputation = this.reputations.get(userId);
    const adjustments = this.adjustments.get(userId) || [];
    const badges = this.badges.get(userId) || [];

    return JSON.stringify({
      reputation,
      adjustments,
      badges,
      exportedAt: Date.now(),
    }, null, 2);
  }
}

export const reputationService = new ReputationService();
