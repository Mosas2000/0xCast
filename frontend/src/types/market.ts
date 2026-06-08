/**
 * Market Status Enum
 * 
 * Represents the current state of a prediction market
 */
export enum MarketStatus {
  /** Market is active and accepting predictions */
  ACTIVE = 1,
  /** Market has been resolved with a final outcome */
  RESOLVED = 2,
  /** Market outcome is being disputed */
  DISPUTED = 3,
  /** Market has been refunded to participants */
  REFUNDED = 4,
}

/**
 * Market Outcome Enum
 * 
 * Represents the final outcome of a resolved market
 */
export enum MarketOutcome {
  /** No outcome yet (market not resolved) */
  NONE = 0,
  /** YES outcome won */
  YES = 1,
  /** NO outcome won */
  NO = 2,
}

/**
 * Type guard to check if a value is a valid MarketStatus
 * 
 * @param value - Value to check
 * @returns true if value is a valid MarketStatus
 * 
 * @example
 * ```typescript
 * if (isMarketStatus(status)) {
 *   console.log('Valid status:', MarketStatus[status]);
 * }
 * ```
 */
export function isMarketStatus(value: unknown): value is MarketStatus {
  return (
    typeof value === 'number' &&
    Object.values(MarketStatus).includes(value as MarketStatus)
  );
}

/**
 * Type guard to check if a value is a valid MarketOutcome
 * 
 * @param value - Value to check
 * @returns true if value is a valid MarketOutcome
 * 
 * @example
 * ```typescript
 * if (isMarketOutcome(outcome)) {
 *   console.log('Valid outcome:', MarketOutcome[outcome]);
 * }
 * ```
 */
export function isMarketOutcome(value: unknown): value is MarketOutcome {
  return (
    typeof value === 'number' &&
    Object.values(MarketOutcome).includes(value as MarketOutcome)
  );
}

/**
 * Get human-readable label for MarketStatus
 * 
 * @param status - MarketStatus value
 * @returns Human-readable status label
 * 
 * @example
 * ```typescript
 * const label = getMarketStatusLabel(MarketStatus.ACTIVE);
 * console.log(label); // "Active"
 * ```
 */
export function getMarketStatusLabel(status: MarketStatus): string {
  switch (status) {
    case MarketStatus.ACTIVE:
      return 'Active';
    case MarketStatus.RESOLVED:
      return 'Resolved';
    case MarketStatus.DISPUTED:
      return 'Disputed';
    case MarketStatus.REFUNDED:
      return 'Refunded';
    default:
      return 'Unknown';
  }
}

/**
 * Get human-readable label for MarketOutcome
 * 
 * @param outcome - MarketOutcome value
 * @returns Human-readable outcome label
 * 
 * @example
 * ```typescript
 * const label = getMarketOutcomeLabel(MarketOutcome.YES);
 * console.log(label); // "Yes"
 * ```
 */
export function getMarketOutcomeLabel(outcome: MarketOutcome): string {
  switch (outcome) {
    case MarketOutcome.NONE:
      return 'Unresolved';
    case MarketOutcome.YES:
      return 'Yes';
    case MarketOutcome.NO:
      return 'No';
    default:
      return 'Unknown';
  }
}

/**
 * Check if a market can accept predictions
 * 
 * @param status - Current market status
 * @returns true if market is accepting predictions
 * 
 * @example
 * ```typescript
 * if (canAcceptPredictions(market.status)) {
 *   // Show prediction form
 * }
 * ```
 */
export function canAcceptPredictions(status: MarketStatus): boolean {
  return status === MarketStatus.ACTIVE;
}

/**
 * Check if a market can be resolved
 * 
 * @param status - Current market status
 * @returns true if market can be resolved
 * 
 * @example
 * ```typescript
 * if (canResolveMarket(market.status)) {
 *   // Show resolve button
 * }
 * ```
 */
export function canResolveMarket(status: MarketStatus): boolean {
  return status === MarketStatus.ACTIVE || status === MarketStatus.DISPUTED;
}

/**
 * Check if winnings can be claimed from a market
 * 
 * @param status - Current market status
 * @param outcome - Market outcome
 * @returns true if winnings can be claimed
 * 
 * @example
 * ```typescript
 * if (canClaimWinnings(market.status, market.outcome)) {
 *   // Show claim button
 * }
 * ```
 */
export function canClaimWinnings(status: MarketStatus, outcome?: MarketOutcome): boolean {
  return status === MarketStatus.RESOLVED && outcome !== undefined && outcome !== MarketOutcome.NONE;
}

export interface Market {
  id: string;
  title: string;
  question?: string; // Alias for title, used by some components
  description: string;
  creator: string;
  endTime: number;
  resolved: boolean;
  outcome?: number;
  status?: MarketStatus; // Market status enum
  totalVolume: number;
  currentPrice: number;
  category?: string;
  totalYesStake?: number; // Total YES stakes
  totalNoStake?: number; // Total NO stakes
}

/**
 * Type guard to check if a value is a valid Market object
 * 
 * @param value - Value to check
 * @returns true if value is a valid Market
 * 
 * @example
 * ```typescript
 * const data = await fetchMarket(id);
 * if (isMarket(data)) {
 *   console.log('Market title:', data.title);
 * }
 * ```
 */
export function isMarket(value: unknown): value is Market {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.creator === 'string' &&
    typeof obj.endTime === 'number' &&
    typeof obj.resolved === 'boolean' &&
    typeof obj.totalVolume === 'number' &&
    typeof obj.currentPrice === 'number' &&
    (obj.outcome === undefined || typeof obj.outcome === 'number') &&
    (obj.category === undefined || typeof obj.category === 'string')
  );
}

export interface Prediction {
  id: string;
  marketId: string;
  userId: string;
  outcome: number;
  amount: number;
  timestamp: number;
  shares: number;
}

/**
 * Type guard to check if a value is a valid Prediction object
 * 
 * @param value - Value to check
 * @returns true if value is a valid Prediction
 */
export function isPrediction(value: unknown): value is Prediction {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.marketId === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.outcome === 'number' &&
    typeof obj.amount === 'number' &&
    typeof obj.timestamp === 'number' &&
    typeof obj.shares === 'number'
  );
}

export interface MarketStatistics {
  poolId: string;
  reserveA: number;
  reserveB: number;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  priceImpact: number;
}

export interface PoolModel {
  type: 'CONSTANT_PRODUCT' | 'STABLE_SWAP' | 'WEIGHTED';
  parameters: PoolParameters;
}

export interface PoolParameters {
  fee: number;
  amplification?: number;
  weights?: number[];
}

export interface Pool {
  id: string;
  model: 'CONSTANT_PRODUCT' | 'STABLE_SWAP' | 'WEIGHTED';
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  totalShares: number;
  fee: number;
}


/**
 * Market Categories
 */
export const MARKET_CATEGORIES = [
  'crypto',
  'sports',
  'politics',
  'entertainment',
  'technology',
  'weather',
  'other',
] as const;

export type MarketCategory = typeof MARKET_CATEGORIES[number];

/**
 * Market Durations (in blocks, ~10 min per block)
 */
export const MARKET_DURATIONS = {
  ONE_HOUR: 6,
  ONE_DAY: 144,
  ONE_WEEK: 1008,
  TWO_WEEKS: 2016,
  ONE_MONTH: 4320,
  THREE_MONTHS: 12960,
  SIX_MONTHS: 25920,
} as const;

/**
 * Category Metadata for UI display
 */
export const CATEGORY_METADATA: Record<MarketCategory, { label: string; icon: string; color: string }> = {
  crypto: { label: 'Cryptocurrency', icon: '₿', color: 'orange' },
  sports: { label: 'Sports', icon: '⚽', color: 'green' },
  politics: { label: 'Politics', icon: '🏛️', color: 'blue' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: 'purple' },
  technology: { label: 'Technology', icon: '💻', color: 'cyan' },
  weather: { label: 'Weather', icon: '🌤️', color: 'sky' },
  other: { label: 'Other', icon: '📊', color: 'gray' },
};

/**
 * Category Colors for styling
 */
export const CATEGORY_COLORS: Record<MarketCategory, string> = {
  crypto: 'text-orange-400',
  sports: 'text-green-400',
  politics: 'text-blue-400',
  entertainment: 'text-purple-400',
  technology: 'text-cyan-400',
  weather: 'text-sky-400',
  other: 'text-gray-400',
};

/**
 * Form data for creating a new market
 */
export interface CreateMarketFormData {
  question: string;
  description: string;
  category: MarketCategory;
  duration: number;
  endTime?: number;
  oracleType?: string;
  template?: string;
}
