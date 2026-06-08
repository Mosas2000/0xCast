import { describe, it, expect, beforeEach } from 'vitest';
import {
  ReputationCalculator,
  FraudRiskCalculator,
  KYCProgressTracker,
  TrustScoreBuilder,
  ReputationMilestones,
} from '../utils/reputationCalculations';

describe('ReputationCalculator', () => {
  it('should calculate reputation score from metrics', () => {
    const score = ReputationCalculator.calculateScore({
      completionRate: 0.95,
      transactionVolume: 50,
      averageResponseTime: 2,
      accountAgeDays: 180,
      verificationLevel: 'level3',
    });

    expect(score.score).toBeGreaterThan(50);
    expect(score.level).toBe('trusted');
  });

  it('should determine correct reputation level', () => {
    expect(ReputationCalculator.getLevel(30)).toBe('new');
    expect(ReputationCalculator.getLevel(60)).toBe('trusted');
    expect(ReputationCalculator.getLevel(75)).toBe('verified');
    expect(ReputationCalculator.getLevel(90)).toBe('elite');
  });

  it('should qualify for badges based on metrics', () => {
    const badges = ReputationCalculator.calculateBadgeQualifications({
      completionRate: 0.95,
      transactionVolume: 100,
      averageResponseTime: 1,
      accountAgeDays: 365,
      verificationLevel: 'level3',
    });

    expect(badges).toContain('active_trader');
    expect(badges).toContain('high_volume');
    expect(badges).toContain('fast_responder');
    expect(badges).toContain('verified_kyc');
    expect(badges).toContain('long_time_user');
  });

  it('should suggest repair actions when score is low', () => {
    const actions = ReputationCalculator.calculateRepairActions(30, 70);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].impact).toBeGreaterThanOrEqual(actions[actions.length - 1].impact);
  });

  it('should not suggest actions when score is already high', () => {
    const actions = ReputationCalculator.calculateRepairActions(80, 70);
    expect(actions.length).toBe(0);
  });
});

describe('FraudRiskCalculator', () => {
  it('should calculate fraud risk from activities', () => {
    const result = FraudRiskCalculator.calculateRisk([
      { type: 'wash_trading', severity: 'high' },
      { type: 'sybil_attack', severity: 'critical' },
    ]);

    expect(result.score).toBeGreaterThan(0);
    expect(result.level).toBeTruthy();
    expect(result.factors.length).toBe(2);
  });

  it('should return low risk for empty activities', () => {
    const result = FraudRiskCalculator.calculateRisk([]);

    expect(result.score).toBe(0);
    expect(result.level).toBe('low');
    expect(result.factors.length).toBe(0);
  });

  it('should determine critical level correctly', () => {
    const result = FraudRiskCalculator.calculateRisk([
      { type: 'wash_trading', severity: 'critical' },
      { type: 'sybil_attack', severity: 'critical' },
      { type: 'pump_and_dump', severity: 'critical' },
    ]);

    expect(result.level).toBe('critical');
  });

  it('should indicate if user should be blocked', () => {
    const shouldBlock = FraudRiskCalculator.shouldBlockUser(80);
    expect(shouldBlock).toBe(true);

    const shouldNotBlock = FraudRiskCalculator.shouldBlockUser(50);
    expect(shouldNotBlock).toBe(false);
  });

  it('should indicate if user needs approval', () => {
    const needsApproval = FraudRiskCalculator.shouldRequireApproval(60);
    expect(needsApproval).toBe(true);

    const noApproval = FraudRiskCalculator.shouldRequireApproval(20);
    expect(noApproval).toBe(false);
  });

  it('should indicate if user needs monitoring', () => {
    const needsMonitoring = FraudRiskCalculator.shouldMonitor(30);
    expect(needsMonitoring).toBe(true);

    const noMonitoring = FraudRiskCalculator.shouldMonitor(10);
    expect(noMonitoring).toBe(false);
  });
});

describe('KYCProgressTracker', () => {
  it('should track KYC progress at level 1', () => {
    const progress = KYCProgressTracker.calculateProgress({
      status: 'in_progress',
      level: 'level1',
    });

    expect(progress.percentage).toBe(33);
    expect(progress.completedSteps.length).toBe(1);
    expect(progress.nextStep).toContain('Address');
  });

  it('should track KYC progress at level 2', () => {
    const progress = KYCProgressTracker.calculateProgress({
      status: 'in_progress',
      level: 'level2',
    });

    expect(progress.percentage).toBe(66);
    expect(progress.completedSteps.length).toBe(2);
    expect(progress.nextStep).toContain('Face');
  });

  it('should indicate complete KYC', () => {
    const progress = KYCProgressTracker.calculateProgress({
      status: 'approved',
      level: 'level3',
    });

    expect(progress.percentage).toBe(100);
    expect(progress.completedSteps.length).toBe(3);
    expect(progress.nextStep).toContain('Complete');
  });

  it('should estimate completion time', () => {
    const estimate = KYCProgressTracker.estimateTimeToCompletion();
    expect(estimate.minutes).toBe(15);
    expect(estimate.description).toContain('15');
  });
});

describe('TrustScoreBuilder', () => {
  it('should build trust score from multiple sources', () => {
    const score = TrustScoreBuilder.buildFromMultipleSources({
      reputation: 75,
      kycLevel: 3,
      accountAge: 180,
      fraudAlerts: 0,
    });

    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should penalize fraud alerts', () => {
    const cleanScore = TrustScoreBuilder.buildFromMultipleSources({
      reputation: 75,
      kycLevel: 3,
      accountAge: 180,
      fraudAlerts: 0,
    });

    const withAlertsScore = TrustScoreBuilder.buildFromMultipleSources({
      reputation: 75,
      kycLevel: 3,
      accountAge: 180,
      fraudAlerts: 5,
    });

    expect(withAlertsScore).toBeLessThan(cleanScore);
  });

  it('should provide recommendations for low scores', () => {
    const recommendations = TrustScoreBuilder.getRecommendations(25);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toContain('KYC');
  });

  it('should provide recommendations for high scores', () => {
    const recommendations = TrustScoreBuilder.getRecommendations(85);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toContain('excellent');
  });
});

describe('ReputationMilestones', () => {
  it('should list all milestones', () => {
    const milestones = ReputationMilestones.getMilestones();
    expect(milestones.length).toBe(4);
    expect(milestones[0].level).toBe('new');
    expect(milestones[3].level).toBe('elite');
  });

  it('should find next milestone for low score', () => {
    const next = ReputationMilestones.getNextMilestone(25);
    expect(next).not.toBeNull();
    expect(next?.level).toBe('new');
    expect(next?.pointsRemaining).toBeGreaterThan(0);
  });

  it('should find next milestone for mid score', () => {
    const next = ReputationMilestones.getNextMilestone(60);
    expect(next).not.toBeNull();
    expect(next?.level).toBe('verified');
  });

  it('should return null for elite users', () => {
    const next = ReputationMilestones.getNextMilestone(90);
    expect(next).toBeNull();
  });

  it('should include rewards in milestones', () => {
    const milestones = ReputationMilestones.getMilestones();
    const elite = milestones.find((m) => m.level === 'elite');
    expect(elite?.rewards.length).toBeGreaterThan(0);
  });
});
