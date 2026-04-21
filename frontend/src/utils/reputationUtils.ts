import {
  ReputationScore,
  ReputationLevel,
  Badge,
  SuspiciousActivity,
  FraudRiskLevel,
  FraudAlert,
} from '../types/reputation';

export function calculateReputationPercentage(score: ReputationScore): number {
  return Math.min(100, Math.max(0, score.score));
}

export function getReputationColor(level: ReputationLevel): string {
  switch (level) {
    case 'new':
      return '#9CA3AF';
    case 'trusted':
      return '#3B82F6';
    case 'verified':
      return '#10B981';
    case 'elite':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
}

export function getReputationDescription(level: ReputationLevel): string {
  switch (level) {
    case 'new':
      return 'New user with limited history';
    case 'trusted':
      return 'Established user with good behavior';
    case 'verified':
      return 'Verified user with strong history';
    case 'elite':
      return 'Elite user with excellent track record';
    default:
      return 'Unknown reputation level';
  }
}

export function calculateFraudRiskScore(activities: SuspiciousActivity[]): number {
  if (activities.length === 0) return 0;

  let totalRisk = 0;
  const activityTypeWeights: Record<string, number> = {
    wash_trading: 25,
    sybil_attack: 30,
    pump_and_dump: 20,
    price_manipulation: 15,
    volume_spoofing: 20,
    unusual_pattern: 10,
  };

  activities.forEach((activity) => {
    const weight = activityTypeWeights[activity.type] || 10;
    const severity = activity.severity === 'critical' ? 3 : activity.severity === 'high' ? 2 : 1;
    totalRisk += weight * severity;
  });

  return Math.min(100, totalRisk);
}

export function getFraudRiskLevel(score: number): FraudRiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function getFraudRiskColor(level: FraudRiskLevel): string {
  switch (level) {
    case 'critical':
      return '#DC2626';
    case 'high':
      return '#EA580C';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
}

export function formatReputationBadges(badges: Badge[]): { name: string; icon: string }[] {
  return badges.map((badge) => ({
    name: badge.name,
    icon: getBadgeIcon(badge.type),
  }));
}

function getBadgeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    active_trader: '📈',
    high_volume: '💰',
    fast_responder: '⚡',
    verified_kyc: '✓',
    long_time_user: '⏰',
    low_dispute: '🛡️',
  };
  return iconMap[type] || '⭐';
}

export function estimateReputationChange(
  currentScore: number,
  action: 'positive' | 'negative',
  magnitude: 'small' | 'medium' | 'large',
): number {
  const magnitudes = {
    small: 2,
    medium: 5,
    large: 10,
  };

  const change = magnitudes[magnitude];
  return action === 'positive' ? Math.min(100, currentScore + change) : Math.max(0, currentScore - change);
}

export function getMinimumReputationForAction(action: string): number {
  const actionThresholds: Record<string, number> = {
    create_market: 30,
    place_large_trade: 50,
    participate_liquidity_pool: 40,
    claim_rewards: 25,
    access_premium_features: 70,
    create_private_market: 60,
  };
  return actionThresholds[action] || 50;
}

export function formatRewardAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }
  return amount.toFixed(2);
}

export function calculateDaysUntilKYCExpiry(kycApprovedAt: number): number {
  const expiryMs = kycApprovedAt + 365 * 24 * 60 * 60 * 1000;
  const daysRemaining = (expiryMs - Date.now()) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(daysRemaining));
}

export function isKYCExpiringSoon(kycApprovedAt: number, daysThreshold: number = 30): boolean {
  return calculateDaysUntilKYCExpiry(kycApprovedAt) <= daysThreshold;
}

export function validateAccountLinkingEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAccountLinkingPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateWalletAddress(address: string): boolean {
  if (address.startsWith('S')) {
    return /^S[0-9A-Z]{33}$/.test(address);
  }
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
}

export function detectAnomalousActivity(
  previousTransactionCount: number,
  currentTransactionCount: number,
  timeWindowHours: number,
): boolean {
  if (previousTransactionCount === 0) {
    return currentTransactionCount > 50;
  }

  const expectedRate = previousTransactionCount / 24;
  const actualRate = currentTransactionCount / timeWindowHours;

  return actualRate > expectedRate * 3;
}

export function calculateTrustScore(
  reputationScore: number,
  kycLevel: 'none' | 'level1' | 'level2' | 'level3',
  accountAgeDays: number,
  fraudAlertCount: number,
): number {
  let score = reputationScore * 0.4;

  const kycWeights = {
    none: 0,
    level1: 10,
    level2: 20,
    level3: 30,
  };
  score += kycWeights[kycLevel] * 0.3;

  const ageScore = Math.min(30, (accountAgeDays / 365) * 30);
  score += ageScore * 0.2;

  const fraudPenalty = Math.min(10, fraudAlertCount * 2);
  score -= fraudPenalty * 0.1;

  return Math.max(0, Math.min(100, score));
}

export function formatAMLRiskFactors(factors: { pep: boolean; sanctions: boolean; adverseMedia: boolean }): string[] {
  const result: string[] = [];
  if (factors.pep) result.push('PEP Flag');
  if (factors.sanctions) result.push('Sanctions List');
  if (factors.adverseMedia) result.push('Adverse Media');
  return result;
}
