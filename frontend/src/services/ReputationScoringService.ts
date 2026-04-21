import { ReputationScore, ReputationLevel, ReputationBadge, ReputationAdjustment } from '@/types/reputation';

export class ReputationScoringService {
  private reputationScores: Map<string, ReputationScore> = new Map();
  private reputationHistory: ReputationAdjustment[] = [];

  calculateReputationScore(userId: string, metrics: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageResponseTime: number;
    accountAge: number;
    verificationLevel: number;
  }): ReputationScore {
    const completionRate = metrics.totalTransactions > 0
      ? metrics.successfulTransactions / metrics.totalTransactions
      : 0;

    let score = 0;

    score += completionRate * 40;
    score += Math.min(metrics.totalTransactions / 100, 1) * 20;
    score += Math.min(1 - (metrics.averageResponseTime / 86400000), 1) * 15;
    score += Math.min(metrics.accountAge / (180 * 24 * 60 * 60 * 1000), 1) * 15;
    score += metrics.verificationLevel * 10;

    score = Math.min(100, Math.max(0, score));

    const level = this.determineLevel(score);
    const badges = this.determineBadges(metrics, completionRate);

    const reputationScore: ReputationScore = {
      userId,
      score: Math.round(score * 100) / 100,
      level,
      totalTransactions: metrics.totalTransactions,
      successfulTransactions: metrics.successfulTransactions,
      failedTransactions: metrics.failedTransactions,
      averageResponseTime: metrics.averageResponseTime,
      completionRate: Math.round(completionRate * 10000) / 10000,
      lastUpdated: Date.now(),
      badges,
    };

    this.reputationScores.set(userId, reputationScore);
    return reputationScore;
  }

  private determineLevel(score: number): ReputationLevel {
    if (score >= 85) return 'elite';
    if (score >= 70) return 'verified';
    if (score >= 50) return 'trusted';
    return 'new';
  }

  private determineBadges(metrics: any, completionRate: number): string[] {
    const badges: string[] = [];

    if (metrics.totalTransactions >= 100) badges.push('high_volume_trader');
    if (completionRate >= 0.95) badges.push('reliable_trader');
    if (metrics.accountAge >= 180 * 24 * 60 * 60 * 1000) badges.push('long_standing_member');
    if (metrics.verificationLevel >= 1) badges.push('verified_identity');
    if (metrics.totalTransactions >= 1000) badges.push('elite_trader');

    return badges;
  }

  getReputationScore(userId: string): ReputationScore | undefined {
    return this.reputationScores.get(userId);
  }

  adjustReputation(userId: string, amount: number, reason: string, appliedBy: string): ReputationAdjustment {
    const current = this.reputationScores.get(userId);
    if (!current) {
      throw new Error(`User ${userId} not found`);
    }

    current.score = Math.min(100, Math.max(0, current.score + amount));
    current.level = this.determineLevel(current.score);
    current.lastUpdated = Date.now();

    const adjustment: ReputationAdjustment = {
      adjustmentId: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount,
      reason,
      timestamp: Date.now(),
      appliedBy,
    };

    this.reputationHistory.push(adjustment);
    this.reputationScores.set(userId, current);

    return adjustment;
  }

  getReputationHistory(userId: string): ReputationAdjustment[] {
    return this.reputationHistory.filter(adj => adj.userId === userId);
  }

  getAllScores(): ReputationScore[] {
    return Array.from(this.reputationScores.values());
  }

  getBadges(userId: string): ReputationBadge[] {
    const score = this.reputationScores.get(userId);
    if (!score) return [];

    const allBadges: Map<string, ReputationBadge> = new Map([
      ['high_volume_trader', {
        badgeId: 'badge_hvt',
        name: 'High Volume Trader',
        description: 'Completed 100+ transactions',
        icon: 'chart-line',
        requirement: '100+ transactions',
        earnedAt: score.lastUpdated,
      }],
      ['reliable_trader', {
        badgeId: 'badge_rt',
        name: 'Reliable Trader',
        description: '95%+ completion rate',
        icon: 'check-circle',
        requirement: '95%+ completion rate',
        earnedAt: score.lastUpdated,
      }],
      ['long_standing_member', {
        badgeId: 'badge_lsm',
        name: 'Long Standing Member',
        description: 'Account for 6+ months',
        icon: 'star',
        requirement: '6+ months',
        earnedAt: score.lastUpdated,
      }],
      ['verified_identity', {
        badgeId: 'badge_vi',
        name: 'Verified Identity',
        description: 'Identity verified',
        icon: 'shield-check',
        requirement: 'KYC verified',
        earnedAt: score.lastUpdated,
      }],
      ['elite_trader', {
        badgeId: 'badge_et',
        name: 'Elite Trader',
        description: '1000+ transactions',
        icon: 'crown',
        requirement: '1000+ transactions',
        earnedAt: score.lastUpdated,
      }],
    ]);

    return score.badges
      .map(badgeName => allBadges.get(badgeName))
      .filter((badge): badge is ReputationBadge => badge !== undefined);
  }
}
