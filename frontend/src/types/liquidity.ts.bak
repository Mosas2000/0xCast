/**
 * Liquidity Types
 * 
 * Type definitions for liquidity pools, LP positions, and rewards.
 * Used across the liquidity dashboard and related components.
 */

/**
 * Liquidity pool data
 */
export interface LiquidityPool {
  marketId: number;
  stxBalance: bigint;
  tokenBalances: number[];
  totalShares: bigint;
  active: boolean;
}

/**
 * LP position for a user in a specific pool
 */
export interface LPPosition {
  marketId: number;
  provider: string;
  shares: bigint;
  sharePercentage: number;
  estimatedValue: bigint;
}

/**
 * Pool rewards configuration
 */
export interface PoolRewards {
  marketId: number;
  accRewardPerShare: bigint;
  lastUpdateBlock: number;
  rewardMultiplier: number;
}

/**
 * Pending rewards for a provider
 */
export interface PendingRewards {
  marketId: number;
  provider: string;
  amount: bigint;
  claimable: boolean;
}

/**
 * Liquidity action types
 */
export const LIQUIDITY_ACTIONS = {
  CREATE_POOL: 'create-pool',
  ADD_LIQUIDITY: 'add-liquidity',
  REMOVE_LIQUIDITY: 'remove-liquidity',
  CLAIM_REWARDS: 'claim-rewards',
} as const;

export type LiquidityAction = typeof LIQUIDITY_ACTIONS[keyof typeof LIQUIDITY_ACTIONS];

/**
 * Pool statistics for analytics
 */
export interface PoolStats {
  marketId: number;
  tvl: bigint;
  volume24h: bigint;
  fees24h: bigint;
  apy: number;
  lpCount: number;
}

/**
 * Transaction for liquidity history
 */
export interface LiquidityTransaction {
  id: string;
  marketId: number;
  type: 'add' | 'remove' | 'claim';
  provider: string;
  amount: bigint;
  shares: bigint;
  timestamp: number;
  txId: string;
}

/**
 * Fee configuration
 */
export interface FeeConfig {
  platformFeeBasisPoints: number;
  lpFeeBasisPoints: number;
}

/**
 * Default fee configuration (from contract)
 */
export const DEFAULT_FEE_CONFIG: FeeConfig = {
  platformFeeBasisPoints: 30, // 0.3%
  lpFeeBasisPoints: 20, // 0.2%
};

/**
 * Calculate pool share percentage
 */
export function calculateSharePercentage(
  userShares: bigint,
  totalShares: bigint
): number {
  if (totalShares === 0n) return 0;
  return Number((userShares * 10000n) / totalShares) / 100;
}

/**
 * Calculate estimated value of LP position
 */
export function calculatePositionValue(
  shares: bigint,
  totalShares: bigint,
  poolBalance: bigint
): bigint {
  if (totalShares === 0n) return 0n;
  return (shares * poolBalance) / totalShares;
}

/**
 * Format STX amount for display
 */
export function formatStxAmount(microStx: bigint): string {
  const stx = Number(microStx) / 1_000_000;
  if (stx >= 1_000_000) {
    return `${(stx / 1_000_000).toFixed(2)}M`;
  }
  if (stx >= 1_000) {
    return `${(stx / 1_000).toFixed(2)}K`;
  }
  return stx.toFixed(2);
}

/**
 * Calculate APY from rewards and TVL
 */
export function calculateAPY(
  rewardsPerBlock: bigint,
  poolTVL: bigint,
  blocksPerYear: number = 52560 // ~144 blocks/day * 365
): number {
  if (poolTVL === 0n) return 0;
  const yearlyRewards = rewardsPerBlock * BigInt(blocksPerYear);
  return Number((yearlyRewards * 10000n) / poolTVL) / 100;
}

/**
 * Calculate output amount using CPMM formula
 */
export function calculateOutputAmount(
  inputAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  feeBasisPoints: number = 30
): bigint {
  const feeMultiplier = BigInt(10000 - feeBasisPoints);
  const inputWithFee = inputAmount * feeMultiplier;
  const numerator = inputWithFee * outputReserve;
  const denominator = inputReserve * 10000n + inputWithFee;
  return numerator / denominator;
}

/**
 * Calculate price impact percentage
 */
export function calculatePriceImpact(
  inputAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint
): number {
  if (inputReserve === 0n || outputReserve === 0n) return 0;
  
  const spotPrice = Number(outputReserve) / Number(inputReserve);
  const outputAmount = calculateOutputAmount(inputAmount, inputReserve, outputReserve);
  const executionPrice = Number(outputAmount) / Number(inputAmount);
  
  return ((spotPrice - executionPrice) / spotPrice) * 100;
}

/**
 * Validate liquidity amount
 */
export function validateLiquidityAmount(
  amount: string,
  minAmount: bigint = 1000000n, // 1 STX minimum
  maxAmount?: bigint
): { isValid: boolean; error?: string } {
  const parsed = parseFloat(amount);
  
  if (isNaN(parsed) || parsed <= 0) {
    return { isValid: false, error: 'Enter a valid amount' };
  }
  
  const microAmount = BigInt(Math.floor(parsed * 1_000_000));
  
  if (microAmount < minAmount) {
    return { isValid: false, error: `Minimum amount is ${formatStxAmount(minAmount)} STX` };
  }
  
  if (maxAmount && microAmount > maxAmount) {
    return { isValid: false, error: `Maximum amount is ${formatStxAmount(maxAmount)} STX` };
  }
  
  return { isValid: true };
}
