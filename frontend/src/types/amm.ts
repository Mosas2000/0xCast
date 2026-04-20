export interface AMMPool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: bigint;
  reserveB: bigint;
  totalLiquidity: bigint;
  fee: number;
  model: AMMModel;
}

export interface AMMPosition {
  id: string;
  poolId: string;
  liquidityTokens: bigint;
  owner: string;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
}

export interface ConcentratedLiquidityPosition {
  id: string;
  poolId: string;
  owner: string;
  lowerTick: number;
  upperTick: number;
  liquidity: bigint;
  feeGrowthInside: bigint;
}

export interface SwapQuote {
  amountIn: bigint;
  amountOut: bigint;
  priceImpact: number;
  executionPrice: number;
  slippage: number;
  fee: bigint;
}

export interface FlashSwapRequest {
  tokenA: string;
  tokenB: string;
  amountOut: bigint;
  data: string;
}

export interface FlashSwapCallback {
  onFlashLoan(amount: bigint, fee: bigint, data: string): Promise<boolean>;
}

export interface LiquidityRange {
  minimum: bigint;
  maximum: bigint;
}

export interface AMMStats {
  volumeTraded: bigint;
  feesCollected: bigint;
  liquidityUtilization: number;
  slippageAverage: number;
  priceImpactAverage: number;
}

export enum AMMModel {
  CONSTANT_PRODUCT = 'CONSTANT_PRODUCT',
  STABLE_SWAP = 'STABLE_SWAP',
  CONCENTRATED_LIQUIDITY = 'CONCENTRATED_LIQUIDITY',
}

export interface AMMConfig {
  model: AMMModel;
  fee: number;
  protocolFee: number;
  tickSize?: number;
  concentrationFactor?: number;
}

export interface PricePoint {
  tick: number;
  price: number;
  liquidity: bigint;
}

export interface FlashSwapEvent {
  id: string;
  poolId: string;
  requester: string;
  amountBorrowed: bigint;
  amountRepaid: bigint;
  fee: bigint;
  timestamp: number;
}
