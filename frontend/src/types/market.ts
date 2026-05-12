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

export interface Market {
  id: string;
  title: string;
  description: string;
  creator: string;
  endTime: number;
  resolved: boolean;
  outcome?: number;
  totalVolume: number;
  currentPrice: number;
  category?: string;
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
