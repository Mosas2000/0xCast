import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateReputationPercentage,
  getReputationColor,
  getReputationDescription,
  calculateFraudRiskScore,
  getFraudRiskLevel,
  estimateReputationChange,
  getMinimumReputationForAction,
  formatRewardAmount,
  calculateDaysUntilKYCExpiry,
  isKYCExpiringSoon,
  validateAccountLinkingEmail,
  validateAccountLinkingPhone,
  validateWalletAddress,
  detectAnomalousActivity,
  calculateTrustScore,
  formatAMLRiskFactors,
} from '../utils/reputationUtils';

describe('Reputation Utilities', () => {
  it('should calculate reputation percentage correctly', () => {
    const score = { score: 75, level: 'verified' as const };
    const percentage = calculateReputationPercentage(score);
    expect(percentage).toBe(75);
  });

  it('should get correct color for reputation level', () => {
    expect(getReputationColor('new')).toBe('#9CA3AF');
    expect(getReputationColor('trusted')).toBe('#3B82F6');
    expect(getReputationColor('verified')).toBe('#10B981');
    expect(getReputationColor('elite')).toBe('#F59E0B');
  });

  it('should get description for each reputation level', () => {
    expect(getReputationDescription('new')).toContain('New user');
    expect(getReputationDescription('trusted')).toContain('Established');
    expect(getReputationDescription('verified')).toContain('Verified');
    expect(getReputationDescription('elite')).toContain('Elite');
  });

  it('should calculate fraud risk score from activities', () => {
    const activities = [
      { type: 'wash_trading', severity: 'high' as const },
      { type: 'sybil_attack', severity: 'critical' as const },
    ];
    const score = calculateFraudRiskScore(activities);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should determine fraud risk level', () => {
    expect(getFraudRiskLevel(80)).toBe('critical');
    expect(getFraudRiskLevel(60)).toBe('high');
    expect(getFraudRiskLevel(30)).toBe('medium');
    expect(getFraudRiskLevel(10)).toBe('low');
  });

  it('should estimate reputation change correctly', () => {
    const newScore = estimateReputationChange(50, 'positive', 'medium');
    expect(newScore).toBe(55);

    const decreasedScore = estimateReputationChange(50, 'negative', 'medium');
    expect(decreasedScore).toBe(45);
  });

  it('should cap reputation at 100', () => {
    const maxScore = estimateReputationChange(95, 'positive', 'large');
    expect(maxScore).toBeLessThanOrEqual(100);
  });

  it('should prevent reputation from going below 0', () => {
    const minScore = estimateReputationChange(5, 'negative', 'large');
    expect(minScore).toBeGreaterThanOrEqual(0);
  });

  it('should get minimum reputation for action', () => {
    expect(getMinimumReputationForAction('create_market')).toBe(30);
    expect(getMinimumReputationForAction('place_large_trade')).toBe(50);
    expect(getMinimumReputationForAction('access_premium_features')).toBe(70);
  });

  it('should format reward amounts correctly', () => {
    expect(formatRewardAmount(1500000)).toContain('M');
    expect(formatRewardAmount(150000)).toContain('K');
    expect(formatRewardAmount(150)).toContain('150');
  });

  it('should calculate days until KYC expiry', () => {
    const approvedAt = Date.now() - (365 - 60) * 24 * 60 * 60 * 1000;
    const days = calculateDaysUntilKYCExpiry(approvedAt);
    expect(days).toBeGreaterThan(50);
    expect(days).toBeLessThanOrEqual(60);
  });

  it('should detect KYC expiry soon', () => {
    const soon = Date.now() - (365 - 20) * 24 * 60 * 60 * 1000;
    const notSoon = Date.now() - (365 - 100) * 24 * 60 * 60 * 1000;

    expect(isKYCExpiringSoon(soon, 30)).toBe(true);
    expect(isKYCExpiringSoon(notSoon, 30)).toBe(false);
  });
});

describe('Account Linking Validation', () => {
  it('should validate email addresses', () => {
    expect(validateAccountLinkingEmail('john@example.com')).toBe(true);
    expect(validateAccountLinkingEmail('invalid.email')).toBe(false);
    expect(validateAccountLinkingEmail('user+tag@domain.co.uk')).toBe(true);
  });

  it('should validate phone numbers', () => {
    expect(validateAccountLinkingPhone('+14155552671')).toBe(true);
    expect(validateAccountLinkingPhone('(415) 555-2671')).toBe(true);
    expect(validateAccountLinkingPhone('415-555-2671')).toBe(true);
    expect(validateAccountLinkingPhone('invalid')).toBe(false);
  });

  it('should validate Stacks wallet addresses', () => {
    expect(validateWalletAddress('SP2D5BGGJ956A635JG7CJA5NOT2QYW5QNXNJAAABC')).toBe(true);
    expect(validateWalletAddress('ST1J4G6RR643BMNVG02CFPXTMVEA7S63WFVEA6XRD')).toBe(true);
    expect(validateWalletAddress('invalid')).toBe(false);
  });

  it('should validate Ethereum addresses', () => {
    expect(validateWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f42D5f')).toBe(true);
    expect(validateWalletAddress('0x' + 'a'.repeat(40))).toBe(true);
  });
});

describe('Fraud Detection Validation', () => {
  it('should detect anomalous transaction activity', () => {
    const anomalous = detectAnomalousActivity(10, 100, 8);
    expect(anomalous).toBe(true);

    const normal = detectAnomalousActivity(100, 110, 24);
    expect(normal).toBe(false);
  });

  it('should handle zero previous transaction count', () => {
    const anomalous = detectAnomalousActivity(0, 60, 24);
    expect(anomalous).toBe(true);

    const normal = detectAnomalousActivity(0, 40, 24);
    expect(normal).toBe(false);
  });
});

describe('Trust Score Calculation', () => {
  it('should calculate trust score from multiple factors', () => {
    const score = calculateTrustScore(75, 'level3', 180, 0);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should penalize fraud alerts', () => {
    const cleanScore = calculateTrustScore(75, 'level2', 180, 0);
    const withFraudScore = calculateTrustScore(75, 'level2', 180, 3);
    expect(withFraudScore).toBeLessThan(cleanScore);
  });

  it('should favor higher KYC levels', () => {
    const level1Score = calculateTrustScore(75, 'level1', 180, 0);
    const level3Score = calculateTrustScore(75, 'level3', 180, 0);
    expect(level3Score).toBeGreaterThan(level1Score);
  });

  it('should reward older accounts', () => {
    const newScore = calculateTrustScore(75, 'level2', 30, 0);
    const oldScore = calculateTrustScore(75, 'level2', 365, 0);
    expect(oldScore).toBeGreaterThan(newScore);
  });
});

describe('AML Risk Formatting', () => {
  it('should format AML risk factors', () => {
    const factors = { pep: true, sanctions: false, adverseMedia: true };
    const formatted = formatAMLRiskFactors(factors);

    expect(formatted).toContain('PEP Flag');
    expect(formatted).toContain('Adverse Media');
    expect(formatted).not.toContain('Sanctions List');
  });

  it('should handle empty risk factors', () => {
    const factors = { pep: false, sanctions: false, adverseMedia: false };
    const formatted = formatAMLRiskFactors(factors);

    expect(formatted).toEqual([]);
  });
});
