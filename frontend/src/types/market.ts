export enum MarketStatus {
  ACTIVE = 1,
  RESOLVED = 2,
  DISPUTED = 3,
  REFUNDED = 4,
}

export enum MarketOutcome {
  NONE = 0,
  YES = 1,
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
