import { ReputationScore, ReputationLevel, Badge, SuspiciousActivity } from '../types/reputation';

export class ReputationCalculator {
  private static readonly WEIGHTS = {
    completionRate: 0.4,
    transactionVolume: 0.2,
    responseTime: 0.15,
    accountAge: 0.15,
    verificationLevel: 0.1,
  };

  private static readonly LEVEL_THRESHOLDS = {
    new: 0,
    trusted: 50,
    verified: 70,
    elite: 85,
  };

  static calculateScore(metrics: {
    completionRate: number;
    transactionVolume: number;
    averageResponseTime: number;
    accountAgeDays: number;
    verificationLevel: string;
  }): ReputationScore {
    const completionScore = Math.min(100, metrics.completionRate * 100);
    const volumeScore = Math.min(100, (metrics.transactionVolume / 100) * 100);
    const responseScore = Math.max(0, 100 - metrics.averageResponseTime * 10);
    const ageScore = Math.min(100, (metrics.accountAgeDays / 365) * 100);
    const verificationScore = this.getVerificationScore(metrics.verificationLevel);

    const totalScore =
      completionScore * this.WEIGHTS.completionRate +
      volumeScore * this.WEIGHTS.transactionVolume +
      responseScore * this.WEIGHTS.responseTime +
      ageScore * this.WEIGHTS.accountAge +
      verificationScore * this.WEIGHTS.verificationLevel;

    const level = this.getLevel(totalScore);

    return {
      score: Math.min(100, Math.max(0, totalScore)),
      level,
      timestamp: Date.now(),
    };
  }

  static getLevel(score: number): ReputationLevel {
    if (score >= this.LEVEL_THRESHOLDS.elite) return 'elite';
    if (score >= this.LEVEL_THRESHOLDS.verified) return 'verified';
    if (score >= this.LEVEL_THRESHOLDS.trusted) return 'trusted';
    return 'new';
  }

  private static getVerificationScore(level: string): number {
    switch (level) {
      case 'level3':
        return 100;
      case 'level2':
        return 50;
      case 'level1':
        return 25;
      default:
        return 0;
    }
  }

  static calculateBadgeQualifications(metrics: {
    completionRate: number;
    transactionVolume: number;
    averageResponseTime: number;
    accountAgeDays: number;
    verificationLevel: string;
  }): string[] {
    const badges: string[] = [];

    if (metrics.completionRate >= 0.95 && metrics.transactionVolume >= 80) {
      badges.push('active_trader');
    }

    if (metrics.transactionVolume >= 100) {
      badges.push('high_volume');
    }

    if (metrics.averageResponseTime <= 2) {
      badges.push('fast_responder');
    }

    if (metrics.verificationLevel === 'level3') {
      badges.push('verified_kyc');
    }

    if (metrics.accountAgeDays >= 365) {
      badges.push('long_time_user');
    }

    return badges;
  }

  static calculateRepairActions(currentScore: number, targetScore: number): {
    action: string;
    impact: number;
    effort: string;
  }[] {
    const actions: {
      action: string;
      impact: number;
      effort: string;
    }[] = [];
    const gap = targetScore - currentScore;

    if (gap <= 0) {
      return actions;
    }

    actions.push({
      action: 'Complete more trades (increase completion rate)',
      impact: 40,
      effort: 'medium',
    });

    actions.push({
      action: 'Execute more transactions (increase volume)',
      impact: 20,
      effort: 'high',
    });

    actions.push({
      action: 'Reduce response time to market',
      impact: 15,
      effort: 'medium',
    });

    actions.push({
      action: 'Wait for account age to increase',
      impact: 15,
      effort: 'low',
    });

    actions.push({
      action: 'Complete KYC verification',
      impact: 10,
      effort: 'low',
    });

    return actions.sort((a, b) => b.impact - a.impact);
  }
}

export class FraudRiskCalculator {
  static calculateRisk(activities: SuspiciousActivity[]): {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  } {
    if (activities.length === 0) {
      return {
        score: 0,
        level: 'low',
        factors: [],
      };
    }

    const weights: Record<string, number> = {
      wash_trading: 25,
      sybil_attack: 30,
      pump_and_dump: 20,
      price_manipulation: 15,
      volume_spoofing: 20,
      unusual_pattern: 10,
    };

    const severityMultipliers: Record<string, number> = {
      critical: 3,
      high: 2,
      medium: 1,
      low: 0.5,
    };

    let score = 0;
    const factors: string[] = [];

    activities.forEach((activity) => {
      const weight = weights[activity.type] || 10;
      const multiplier = severityMultipliers[activity.severity] || 1;
      score += weight * multiplier;
      factors.push(`${activity.type} (${activity.severity})`);
    });

    score = Math.min(100, score);

    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score >= 75) level = 'critical';
    else if (score >= 50) level = 'high';
    else if (score >= 25) level = 'medium';

    return { score, level, factors };
  }

  static shouldBlockUser(riskScore: number): boolean {
    return riskScore >= 75;
  }

  static shouldRequireApproval(riskScore: number): boolean {
    return riskScore >= 50;
  }

  static shouldMonitor(riskScore: number): boolean {
    return riskScore >= 25;
  }
}

export class KYCProgressTracker {
  static calculateProgress(kycStatus: {
    status: string;
    level: string;
  }): {
    percentage: number;
    nextStep: string;
    completedSteps: string[];
  } {
    const steps = ['Personal Information', 'Address Verification', 'Face Verification'];
    let completedSteps: string[] = [];
    let percentage = 0;

    if (kycStatus.status === 'none') {
      percentage = 0;
    } else if (kycStatus.level === 'level1') {
      completedSteps = [steps[0]];
      percentage = 33;
    } else if (kycStatus.level === 'level2') {
      completedSteps = [steps[0], steps[1]];
      percentage = 66;
    } else if (kycStatus.status === 'approved') {
      completedSteps = steps;
      percentage = 100;
    }

    const nextStep =
      completedSteps.length < steps.length
        ? steps[completedSteps.length]
        : 'Verification Complete';

    return {
      percentage,
      nextStep,
      completedSteps,
    };
  }

  static estimateTimeToCompletion(): {
    minutes: number;
    description: string;
  } {
    return {
      minutes: 15,
      description: '15 minutes for documents, address, and face verification',
    };
  }
}

export class TrustScoreBuilder {
  static buildFromMultipleSources(sources: {
    reputation: number;
    kycLevel: number;
    accountAge: number;
    fraudAlerts: number;
  }): number {
    let score = 0;

    score += sources.reputation * 0.4;
    score += Math.min(30, sources.kycLevel * 10) * 0.3;
    score += Math.min(30, (sources.accountAge / 365) * 30) * 0.2;
    score -= Math.min(10, sources.fraudAlerts * 2) * 0.1;

    return Math.max(0, Math.min(100, score));
  }

  static getRecommendations(score: number): string[] {
    const recommendations: string[] = [];

    if (score < 30) {
      recommendations.push('Complete KYC verification to increase trust');
      recommendations.push('Execute some trades to build history');
      recommendations.push('Wait for account age to increase');
    } else if (score < 60) {
      recommendations.push('Complete full KYC (level 3) verification');
      recommendations.push('Increase trading volume');
      recommendations.push('Maintain low response times');
    } else if (score < 80) {
      recommendations.push('Consider participating in liquidity pools');
      recommendations.push('Continue building positive reputation');
    } else {
      recommendations.push('You have excellent trust score');
      recommendations.push('Consider market creation or premium features');
    }

    return recommendations;
  }
}

export class ReputationMilestones {
  static getMilestones(): Array<{
    level: string;
    score: number;
    description: string;
    rewards: string[];
  }> {
    return [
      {
        level: 'new',
        score: 30,
        description: 'Just starting out',
        rewards: [],
      },
      {
        level: 'trusted',
        score: 50,
        description: 'Building a reputation',
        rewards: ['Reduced trading fees', 'Access to basic features'],
      },
      {
        level: 'verified',
        score: 70,
        description: 'Strong track record',
        rewards: ['Premium market creation', 'Higher trading limits', 'Priority support'],
      },
      {
        level: 'elite',
        score: 85,
        description: 'Excellent standing',
        rewards: [
          'Exclusive markets',
          'Referral program',
          'Premium analytics',
          'Direct support line',
        ],
      },
    ];
  }

  static getNextMilestone(currentScore: number): {
    level: string;
    score: number;
    description: string;
    pointsRemaining: number;
  } | null {
    const milestones = this.getMilestones();

    for (const milestone of milestones) {
      if (currentScore < milestone.score) {
        return {
          level: milestone.level,
          score: milestone.score,
          description: milestone.description,
          pointsRemaining: milestone.score - currentScore,
        };
      }
    }

    return null;
  }
}
