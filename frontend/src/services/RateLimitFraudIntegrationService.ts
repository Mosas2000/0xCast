import { rateLimitService } from './RateLimitService';
import { fraudDetectionService } from './FraudDetectionService';

interface SuspiciousActivity {
  userId: string;
  action: string;
  timestamp: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export class RateLimitFraudIntegrationService {
  private suspiciousActivities: SuspiciousActivity[] = [];
  private readonly SUSPICIOUS_THRESHOLD = 0.8;
  private readonly MONITORING_WINDOW = 3600000;

  monitorRateLimitViolations(userId: string, action: string): void {
    const status = rateLimitService.getRateLimitStatus(userId, action);
    
    if (status.blocked) {
      this.recordSuspiciousActivity({
        userId,
        action,
        timestamp: Date.now(),
        reason: 'Rate limit exceeded',
        severity: 'medium',
      });

      fraudDetectionService.reportSuspiciousActivity(userId, {
        type: 'rate_limit_violation',
        severity: 'medium',
        details: `User exceeded rate limit for action: ${action}`,
        timestamp: Date.now(),
      });
    }

    const utilizationRate = status.count / status.limit;
    if (utilizationRate >= this.SUSPICIOUS_THRESHOLD && !status.blocked) {
      this.recordSuspiciousActivity({
        userId,
        action,
        timestamp: Date.now(),
        reason: 'High rate limit utilization',
        severity: 'low',
      });
    }
  }

  detectAnomalousPatterns(userId: string): {
    isAnomalous: boolean;
    patterns: string[];
    riskScore: number;
  } {
    const allLimits = rateLimitService.getAllUserLimits(userId);
    const patterns: string[] = [];
    let riskScore = 0;

    let blockedCount = 0;
    let highUtilizationCount = 0;

    allLimits.forEach((status, action) => {
      if (status.blocked) {
        blockedCount++;
        patterns.push(`Blocked on ${action}`);
        riskScore += 30;
      }

      const utilizationRate = status.count / status.limit;
      if (utilizationRate >= this.SUSPICIOUS_THRESHOLD) {
        highUtilizationCount++;
        patterns.push(`High utilization on ${action} (${Math.round(utilizationRate * 100)}%)`);
        riskScore += 10;
      }
    });

    if (blockedCount >= 3) {
      patterns.push('Multiple simultaneous blocks detected');
      riskScore += 40;
    }

    if (highUtilizationCount >= 5) {
      patterns.push('Excessive activity across multiple actions');
      riskScore += 20;
    }

    return {
      isAnomalous: riskScore >= 50,
      patterns,
      riskScore: Math.min(riskScore, 100),
    };
  }

  getRecentSuspiciousActivities(userId: string, windowMs: number = this.MONITORING_WINDOW): SuspiciousActivity[] {
    const now = Date.now();
    return this.suspiciousActivities.filter(
      activity => activity.userId === userId && now - activity.timestamp < windowMs
    );
  }

  getSuspiciousActivitySummary(userId: string): {
    totalActivities: number;
    bySeverity: Record<string, number>;
    byAction: Record<string, number>;
    recentActivities: SuspiciousActivity[];
  } {
    const activities = this.getRecentSuspiciousActivities(userId);

    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const byAction: Record<string, number> = {};

    activities.forEach(activity => {
      bySeverity[activity.severity]++;
      byAction[activity.action] = (byAction[activity.action] || 0) + 1;
    });

    return {
      totalActivities: activities.length,
      bySeverity,
      byAction,
      recentActivities: activities.slice(-10),
    };
  }

  shouldBlockUser(userId: string): {
    shouldBlock: boolean;
    reason: string;
    recommendedAction: string;
  } {
    const anomalyCheck = this.detectAnomalousPatterns(userId);
    const recentActivities = this.getRecentSuspiciousActivities(userId);

    const highSeverityCount = recentActivities.filter(a => a.severity === 'high').length;
    const mediumSeverityCount = recentActivities.filter(a => a.severity === 'medium').length;

    if (highSeverityCount >= 3) {
      return {
        shouldBlock: true,
        reason: 'Multiple high-severity violations detected',
        recommendedAction: 'Immediate account suspension and manual review',
      };
    }

    if (mediumSeverityCount >= 5) {
      return {
        shouldBlock: true,
        reason: 'Excessive medium-severity violations',
        recommendedAction: 'Temporary suspension and investigation',
      };
    }

    if (anomalyCheck.isAnomalous && anomalyCheck.riskScore >= 70) {
      return {
        shouldBlock: true,
        reason: 'Anomalous behavior pattern detected',
        recommendedAction: 'Enhanced monitoring and rate limit reduction',
      };
    }

    if (recentActivities.length >= 10) {
      return {
        shouldBlock: false,
        reason: 'High activity but below blocking threshold',
        recommendedAction: 'Increased monitoring and warning notification',
      };
    }

    return {
      shouldBlock: false,
      reason: 'Activity within acceptable limits',
      recommendedAction: 'Continue normal monitoring',
    };
  }

  adjustRateLimitsBasedOnBehavior(userId: string): void {
    const anomalyCheck = this.detectAnomalousPatterns(userId);
    
    if (anomalyCheck.riskScore >= 70) {
      const allLimits = rateLimitService.getAllUserLimits(userId);
      
      allLimits.forEach((status, action) => {
        const config = rateLimitService.getConfig(action);
        if (config) {
          rateLimitService.setConfig(action, {
            ...config,
            maxRequests: Math.floor(config.maxRequests * 0.5),
            cooldownMs: (config.cooldownMs || 0) * 2,
          });
        }
      });
    }
  }

  private recordSuspiciousActivity(activity: SuspiciousActivity): void {
    this.suspiciousActivities.push(activity);

    const cutoffTime = Date.now() - this.MONITORING_WINDOW * 2;
    this.suspiciousActivities = this.suspiciousActivities.filter(
      a => a.timestamp > cutoffTime
    );
  }

  clearUserHistory(userId: string): void {
    this.suspiciousActivities = this.suspiciousActivities.filter(
      activity => activity.userId !== userId
    );
  }

  getGlobalStats(): {
    totalSuspiciousActivities: number;
    uniqueUsers: number;
    topViolators: Array<{ userId: string; count: number }>;
  } {
    const userCounts = new Map<string, number>();

    this.suspiciousActivities.forEach(activity => {
      userCounts.set(activity.userId, (userCounts.get(activity.userId) || 0) + 1);
    });

    const topViolators = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSuspiciousActivities: this.suspiciousActivities.length,
      uniqueUsers: userCounts.size,
      topViolators,
    };
  }
}

export const rateLimitFraudIntegrationService = new RateLimitFraudIntegrationService();
