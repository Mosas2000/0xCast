import { describe, it, expect } from 'vitest';
import {
  buildCategoryDistribution,
  buildMarketHealth,
  buildPredictiveInsights,
  buildUserActivity,
  buildVolumeHistory,
  getDaysFromTimeRange,
} from '../analytics';
import { MarketOutcome, MarketStatus, type Market } from '../../types/market';

const markets: Market[] = [
  {
    id: 1,
    question: 'Will BTC hit 100k?',
    creator: 'STTEST1',
    endDate: 2000,
    resolutionDate: 2100,
    totalYesStake: 3_000_000,
    totalNoStake: 1_000_000,
    status: MarketStatus.ACTIVE,
    outcome: MarketOutcome.NONE,
    createdAt: Math.floor(Date.now() / 1000) - 24 * 60 * 60,
  },
  {
    id: 2,
    question: 'Will election candidate win?',
    creator: 'STTEST2',
    endDate: 3000,
    resolutionDate: 3100,
    totalYesStake: 2_000_000,
    totalNoStake: 2_000_000,
    status: MarketStatus.RESOLVED,
    outcome: MarketOutcome.YES,
    createdAt: Math.floor(Date.now() / 1000),
  },
];

describe('analytics utilities', () => {
  it('maps time ranges to day counts', () => {
    expect(getDaysFromTimeRange('24h')).toBe(1);
    expect(getDaysFromTimeRange('7d')).toBe(7);
    expect(getDaysFromTimeRange('30d')).toBe(30);
    expect(getDaysFromTimeRange('90d')).toBe(90);
    expect(getDaysFromTimeRange('all')).toBe(365);
  });

  it('builds category distribution from market questions', () => {
    const categories = buildCategoryDistribution(markets);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.reduce((sum, item) => sum + item.count, 0)).toBe(markets.length);
  });

  it('builds volume history and inferred user activity', () => {
    const history = buildVolumeHistory(markets, 7);
    expect(history).toHaveLength(7);
    const activity = buildUserActivity(history);
    expect(activity).toHaveLength(7);
    expect(activity.every((row) => row.transactions >= 0)).toBe(true);
  });

  it('computes market health snapshot', () => {
    const health = buildMarketHealth(markets);
    expect(health).not.toBeNull();
    expect(health?.activeRate).toBeGreaterThan(0);
    expect(health?.largestPoolFormatted).toBeDefined();
  });

  it('generates predictive insights', () => {
    const insights = buildPredictiveInsights(markets);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].confidence).toBeGreaterThan(0);
  });
});
