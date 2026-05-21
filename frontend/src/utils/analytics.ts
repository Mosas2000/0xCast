import type { Market } from '@/types/market';
import type {
  CategoryData,
  MarketHealthStats,
  PredictiveInsight,
  TimeRange,
  UserActivityData,
  VolumeDataPoint,
} from '@/types/analytics';
import { CATEGORY_COLORS } from '@/types/analytics';

const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(timestampMs: number): number {
  const date = new Date(timestampMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatDay(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDaysFromTimeRange(range: TimeRange): number {
  switch (range) {
    case '24h':
      return 1;
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case 'all':
      return 365;
    default:
      return 30;
  }
}

function bucketMarketQuestion(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('btc') || q.includes('bitcoin') || q.includes('eth') || q.includes('crypto')) return 'Crypto';
  if (q.includes('election') || q.includes('president') || q.includes('vote')) return 'Politics';
  if (q.includes('game') || q.includes('match') || q.includes('win') || q.includes('championship')) return 'Sports';
  if (q.includes('movie') || q.includes('oscar') || q.includes('award')) return 'Entertainment';
  if (q.includes('ai') || q.includes('tech') || q.includes('launch')) return 'Technology';
  if (q.includes('stock') || q.includes('market') || q.includes('price')) return 'Finance';
  return 'Other';
}

export function buildCategoryDistribution(markets: Market[]): CategoryData[] {
  const counts: Record<string, number> = {};
  for (const market of markets) {
    const category = bucketMarketQuestion(market.question);
    counts[category] = (counts[category] || 0) + 1;
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      value: total > 0 ? (count / total) * 100 : 0,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.value - a.value);
}

export function buildVolumeHistory(markets: Market[], days: number): VolumeDataPoint[] {
  const now = Date.now();
  const start = dayStart(now - (days - 1) * DAY_MS);
  const buckets = new Map<number, { volume: number; transactions: number }>();

  for (let i = 0; i < days; i++) {
    buckets.set(start + i * DAY_MS, { volume: 0, transactions: 0 });
  }

  for (const market of markets) {
    const ts = market.createdAt * 1000;
    const bucket = dayStart(ts);
    if (!buckets.has(bucket)) continue;
    const item = buckets.get(bucket);
    if (!item) continue;
    const pool = market.totalYesStake + market.totalNoStake;
    item.volume += pool;
    item.transactions += Math.max(1, Math.floor(pool / 1_000_000));
  }

  return Array.from(buckets.entries()).map(([timestamp, values]) => ({
    date: formatDay(timestamp),
    timestamp,
    volume: values.volume,
    volumeFormatted: (values.volume / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    transactions: values.transactions,
  }));
}

export function buildUserActivity(volumeHistory: VolumeDataPoint[]): UserActivityData[] {
  return volumeHistory.map((point) => {
    const activeUsers = Math.max(1, Math.ceil(point.transactions * 0.7));
    const newUsers = Math.max(0, Math.round(activeUsers * 0.12));
    return {
      date: point.date,
      activeUsers,
      newUsers,
      transactions: point.transactions,
    };
  });
}

export function buildMarketHealth(markets: Market[]): MarketHealthStats | null {
  if (markets.length === 0) return null;

  const pools = markets.map((m) => m.totalYesStake + m.totalNoStake).sort((a, b) => a - b);
  const sumPools = pools.reduce((sum, value) => sum + value, 0);
  const largestPool = pools[pools.length - 1] || 0;
  const top3 = pools.slice(-3).reduce((sum, value) => sum + value, 0);
  const medianPool = pools[Math.floor(pools.length / 2)] || 0;
  const activeMarkets = markets.filter((m) => m.status === 0).length;
  const resolvedMarkets = markets.filter((m) => m.status === 1).length;

  return {
    activeRate: (activeMarkets / markets.length) * 100,
    resolvedRate: (resolvedMarkets / markets.length) * 100,
    averagePoolFormatted: (sumPools / markets.length / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    medianPoolFormatted: (medianPool / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    largestPoolFormatted: (largestPool / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    concentrationTop3: sumPools > 0 ? (top3 / sumPools) * 100 : 0,
  };
}

export function buildPredictiveInsights(markets: Market[]): PredictiveInsight[] {
  return markets
    .map((market) => {
      const yes = market.totalYesStake;
      const no = market.totalNoStake;
      const pool = yes + no;
      const imbalance = pool > 0 ? Math.abs(yes - no) / pool : 0;
      const confidence = Math.min(99, Math.round((50 + imbalance * 50) * 10) / 10);
      const projectedFinalPool = Math.round(pool * 1.18);
      const projectedWinner: 'yes' | 'no' | 'balanced' =
        yes === no ? 'balanced' : yes > no ? 'yes' : 'no';
      const risk: 'low' | 'medium' | 'high' =
        imbalance > 0.35 ? 'low' : imbalance > 0.15 ? 'medium' : 'high';
      return {
        marketId: market.id,
        question: market.question,
        projectedWinner,
        confidence,
        projectedFinalPoolFormatted: (projectedFinalPool / 1_000_000).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }),
        risk,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}
