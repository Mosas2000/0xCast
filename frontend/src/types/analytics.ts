/**
 * Analytics Types
 * 
 * Type definitions for analytics data and metrics
 */

// Platform overview statistics
export interface PlatformStats {
  totalMarkets: number;
  activeMarkets: number;
  resolvedMarkets: number;
  totalVolume: bigint;
  totalVolumeFormatted: string;
  totalUsers: number;
  totalPredictions: number;
  totalFeesCollected: bigint;
  totalFeesFormatted: string;
}

// Market statistics for analytics
export interface MarketStats {
  id: number;
  question: string;
  totalPool: bigint;
  totalPoolFormatted: string;
  yesPool: bigint;
  noPool: bigint;
  yesPercentage: number;
  noPercentage: number;
  predictorCount: number;
  createdAt: number;
  endBlock: number;
  status: 'active' | 'resolved' | 'disputed';
  outcome?: 'yes' | 'no' | null;
}

// Volume data point for charts
export interface VolumeDataPoint {
  date: string;
  timestamp: number;
  volume: number;
  volumeFormatted: string;
  transactions: number;
}

// Category distribution for pie chart
export interface CategoryData {
  name: string;
  value: number;
  count: number;
  color: string;
}

// User activity data
export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  transactions: number;
}

// Personal analytics for connected wallet
export interface PersonalStats {
  totalPredictions: number;
  totalStaked: bigint;
  totalStakedFormatted: string;
  totalWinnings: bigint;
  totalWinningsFormatted: string;
  totalLosses: bigint;
  totalLossesFormatted: string;
  netPnL: bigint;
  netPnLFormatted: string;
  winRate: number;
  wins: number;
  losses: number;
  pendingPositions: number;
  favoriteCategory?: string;
}

export interface MarketHealthStats {
  activeRate: number;
  resolvedRate: number;
  averagePoolFormatted: string;
  medianPoolFormatted: string;
  largestPoolFormatted: string;
  concentrationTop3: number;
}

export interface PredictiveInsight {
  marketId: number;
  question: string;
  projectedWinner: 'yes' | 'no' | 'balanced';
  confidence: number;
  projectedFinalPoolFormatted: string;
  risk: 'low' | 'medium' | 'high';
}

// Position history entry
export interface PositionHistory {
  marketId: number;
  question: string;
  outcome: 'yes' | 'no';
  amount: bigint;
  amountFormatted: string;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  payout?: bigint;
  payoutFormatted?: string;
}

// Time range for analytics queries
export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

// Analytics state
export interface AnalyticsState {
  platformStats: PlatformStats | null;
  topMarkets: MarketStats[];
  volumeHistory: VolumeDataPoint[];
  categoryDistribution: CategoryData[];
  userActivity: UserActivityData[];
  personalStats: PersonalStats | null;
  marketHealth: MarketHealthStats | null;
  predictiveInsights: PredictiveInsight[];
  positionHistory: PositionHistory[];
  isLoading: boolean;
  error: string | null;
  timeRange: TimeRange;
}

// Chart colors
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  gray: '#6B7280',
} as const;

// Category colors for pie chart
export const CATEGORY_COLORS: Record<string, string> = {
  'Crypto': CHART_COLORS.primary,
  'Sports': CHART_COLORS.secondary,
  'Politics': CHART_COLORS.tertiary,
  'Entertainment': CHART_COLORS.purple,
  'Technology': CHART_COLORS.cyan,
  'Finance': CHART_COLORS.pink,
  'Other': CHART_COLORS.gray,
};
