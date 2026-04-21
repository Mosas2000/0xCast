import {
  ReputationScore,
  SuspiciousActivity,
  FraudAlert,
  KYCStatus,
  UserReputation,
  Badge,
} from '../types/reputation';

export interface ReputationMetrics {
  averageScore: number;
  totalUsers: number;
  verifiedUsers: number;
  suspiciousAccountsCount: number;
  fraudAlertsCount: number;
  kycCompletionRate: number;
}

export interface UserReputationTrend {
  date: Date;
  score: number;
  level: string;
}

export interface FraudDetectionStats {
  totalAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  resolvedAlerts: number;
  pendingAlerts: number;
}

export interface ReputationDistribution {
  newUsers: number;
  trustedUsers: number;
  verifiedUsers: number;
  eliteUsers: number;
}

export class ReputationAnalytics {
  private static instance: ReputationAnalytics;

  private constructor() {}

  public static getInstance(): ReputationAnalytics {
    if (!ReputationAnalytics.instance) {
      ReputationAnalytics.instance = new ReputationAnalytics();
    }
    return ReputationAnalytics.instance;
  }

  calculateReputationMetrics(users: Map<string, UserReputation>, alerts: FraudAlert[]): ReputationMetrics {
    const scores = Array.from(users.values()).map((u) => u.score.score);
    const verifiedCount = Array.from(users.values()).filter((u) => u.kycStatus.status === 'approved').length;
    const suspiciousCount = Array.from(users.values()).filter((u) => u.isSuspicious).length;
    const kycCompletionRate =
      users.size > 0 ? (verifiedCount / users.size) * 100 : 0;

    return {
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      totalUsers: users.size,
      verifiedUsers: verifiedCount,
      suspiciousAccountsCount: suspiciousCount,
      fraudAlertsCount: alerts.length,
      kycCompletionRate,
    };
  }

  generateReputationDistribution(users: Map<string, UserReputation>): ReputationDistribution {
    let newUsers = 0,
      trustedUsers = 0,
      verifiedUsers = 0,
      eliteUsers = 0;

    Array.from(users.values()).forEach((user) => {
      switch (user.level) {
        case 'new':
          newUsers++;
          break;
        case 'trusted':
          trustedUsers++;
          break;
        case 'verified':
          verifiedUsers++;
          break;
        case 'elite':
          eliteUsers++;
          break;
      }
    });

    return { newUsers, trustedUsers, verifiedUsers, eliteUsers };
  }

  generateFraudStats(alerts: FraudAlert[]): FraudDetectionStats {
    const alertsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};
    let resolvedCount = 0;

    alerts.forEach((alert) => {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      if (alert.resolved) resolvedCount++;
    });

    return {
      totalAlerts: alerts.length,
      alertsByType,
      alertsBySeverity,
      resolvedAlerts: resolvedCount,
      pendingAlerts: alerts.length - resolvedCount,
    };
  }

  identifyHighRiskUsers(
    users: Map<string, UserReputation>,
    alerts: FraudAlert[],
    riskThreshold: number = 70,
  ): string[] {
    const highRiskUsers: string[] = [];

    Array.from(users.entries()).forEach(([userId, user]) => {
      const userAlerts = alerts.filter((a) => a.userId === userId);
      const riskScore = this.calculateUserRiskScore(user, userAlerts);

      if (riskScore >= riskThreshold) {
        highRiskUsers.push(userId);
      }
    });

    return highRiskUsers;
  }

  private calculateUserRiskScore(user: UserReputation, userAlerts: FraudAlert[]): number {
    let riskScore = 100 - user.score.score;

    const severityWeights = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5,
    };

    userAlerts.forEach((alert) => {
      if (!alert.resolved) {
        riskScore += severityWeights[alert.severity] || 5;
      }
    });

    return Math.min(100, riskScore);
  }

  calculateKYCComplianceRate(users: Map<string, UserReputation>): {
    level1: number;
    level2: number;
    level3: number;
  } {
    const counts = { level1: 0, level2: 0, level3: 0 };
    const total = users.size;

    if (total === 0) return { level1: 0, level2: 0, level3: 0 };

    Array.from(users.values()).forEach((user) => {
      const status = user.kycStatus.status;
      if (status === 'approved' || status === 'in_progress') {
        const level = user.kycStatus.level || 'level1';
        counts[level as keyof typeof counts]++;
      }
    });

    return {
      level1: (counts.level1 / total) * 100,
      level2: (counts.level2 / total) * 100,
      level3: (counts.level3 / total) * 100,
    };
  }

  calculateBadgeDistribution(users: Map<string, UserReputation>): Record<string, number> {
    const distribution: Record<string, number> = {};

    Array.from(users.values()).forEach((user) => {
      user.badges.forEach((badge) => {
        distribution[badge.type] = (distribution[badge.type] || 0) + 1;
      });
    });

    return distribution;
  }

  getReputationTrendForUser(
    userHistory: Array<{ timestamp: number; score: ReputationScore }>,
  ): UserReputationTrend[] {
    return userHistory.map((entry) => ({
      date: new Date(entry.timestamp),
      score: entry.score.score,
      level: entry.score.level,
    }));
  }

  identifyRepetitiveFraudPatterns(
    alerts: FraudAlert[],
    userIds: string[],
  ): Map<string, { pattern: string; count: number }> {
    const patterns = new Map<string, { pattern: string; count: number }>();

    userIds.forEach((userId) => {
      const userAlerts = alerts.filter((a) => a.userId === userId);
      const alertTypes = userAlerts.map((a) => a.type);

      const typeFrequency: Record<string, number> = {};
      alertTypes.forEach((type) => {
        typeFrequency[type] = (typeFrequency[type] || 0) + 1;
      });

      Object.entries(typeFrequency).forEach(([type, count]) => {
        if (count >= 2) {
          patterns.set(`${userId}:${type}`, {
            pattern: `User ${userId} flagged for ${type} ${count} times`,
            count,
          });
        }
      });
    });

    return patterns;
  }

  calculateAverageTimeToVerification(
    users: Map<string, UserReputation>,
  ): {
    averageHours: number;
    medianHours: number;
    minHours: number;
    maxHours: number;
  } {
    const verificationTimes: number[] = [];

    Array.from(users.values()).forEach((user) => {
      if (user.kycStatus.status === 'approved' && user.kycStatus.submittedAt && user.kycStatus.approvedAt) {
        const timeMs = user.kycStatus.approvedAt - user.kycStatus.submittedAt;
        const hours = timeMs / (1000 * 60 * 60);
        verificationTimes.push(hours);
      }
    });

    if (verificationTimes.length === 0) {
      return { averageHours: 0, medianHours: 0, minHours: 0, maxHours: 0 };
    }

    const sorted = verificationTimes.sort((a, b) => a - b);
    const average = verificationTimes.reduce((a, b) => a + b, 0) / verificationTimes.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      averageHours: average,
      medianHours: median,
      minHours: Math.min(...sorted),
      maxHours: Math.max(...sorted),
    };
  }
}

export const reputationAnalytics = ReputationAnalytics.getInstance();
