export interface LiquidityPosition {
  amount: number;
  marketId: number;
  timestamp: number;
  userAddress: string;
}

export interface RewardCalculation {
  dailyReward: number;
  weeklyReward: number;
  monthlyReward: number;
  yearlyReward: number;
  apy: number;
  estimatedValue: number;
}

export interface HistoricalReward {
  timestamp: number;
  amount: number;
  marketId: number;
  userAddress: string;
}

export interface MarketVolume {
  marketId: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  totalVolume: number;
}

const REWARD_RATE_BASE = 0.003;
const SECONDS_PER_DAY = 86400;
const DAYS_PER_YEAR = 365;

export function calculateDailyReward(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number
): number {
  if (totalLiquidity === 0 || liquidityAmount === 0) {
    return 0;
  }

  const userShare = liquidityAmount / totalLiquidity;
  const volumeFees = dailyVolume * REWARD_RATE_BASE;
  const dailyReward = volumeFees * userShare;

  return dailyReward;
}

export function calculateAPY(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number
): number {
  if (liquidityAmount === 0) {
    return 0;
  }

  const dailyReward = calculateDailyReward(
    liquidityAmount,
    totalLiquidity,
    dailyVolume
  );

  const yearlyReward = dailyReward * DAYS_PER_YEAR;
  const apy = (yearlyReward / liquidityAmount) * 100;

  return apy;
}

export function calculateRewardProjection(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number
): RewardCalculation {
  const dailyReward = calculateDailyReward(
    liquidityAmount,
    totalLiquidity,
    dailyVolume
  );

  const weeklyReward = dailyReward * 7;
  const monthlyReward = dailyReward * 30;
  const yearlyReward = dailyReward * DAYS_PER_YEAR;

  const apy = calculateAPY(liquidityAmount, totalLiquidity, dailyVolume);

  const estimatedValue = liquidityAmount + yearlyReward;

  return {
    dailyReward,
    weeklyReward,
    monthlyReward,
    yearlyReward,
    apy,
    estimatedValue,
  };
}

export function calculateHistoricalAPY(
  historicalRewards: HistoricalReward[],
  liquidityAmount: number,
  periodDays: number
): number {
  if (historicalRewards.length === 0 || liquidityAmount === 0) {
    return 0;
  }

  const now = Date.now();
  const periodStart = now - periodDays * SECONDS_PER_DAY * 1000;

  const rewardsInPeriod = historicalRewards.filter(
    (reward) => reward.timestamp >= periodStart
  );

  const totalRewards = rewardsInPeriod.reduce(
    (sum, reward) => sum + reward.amount,
    0
  );

  const dailyAverage = totalRewards / periodDays;
  const yearlyProjection = dailyAverage * DAYS_PER_YEAR;
  const apy = (yearlyProjection / liquidityAmount) * 100;

  return apy;
}

export function estimateRewardsByVolume(
  liquidityAmount: number,
  totalLiquidity: number,
  volume: MarketVolume
): {
  based24h: RewardCalculation;
  based7d: RewardCalculation;
  based30d: RewardCalculation;
} {
  const dailyVolume24h = volume.volume24h;
  const dailyVolume7d = volume.volume7d / 7;
  const dailyVolume30d = volume.volume30d / 30;

  return {
    based24h: calculateRewardProjection(
      liquidityAmount,
      totalLiquidity,
      dailyVolume24h
    ),
    based7d: calculateRewardProjection(
      liquidityAmount,
      totalLiquidity,
      dailyVolume7d
    ),
    based30d: calculateRewardProjection(
      liquidityAmount,
      totalLiquidity,
      dailyVolume30d
    ),
  };
}

export function calculateOptimalLiquidityAmount(
  targetAPY: number,
  totalLiquidity: number,
  dailyVolume: number
): number {
  if (targetAPY === 0 || dailyVolume === 0) {
    return 0;
  }

  const volumeFees = dailyVolume * REWARD_RATE_BASE;
  const yearlyFees = volumeFees * DAYS_PER_YEAR;

  const targetYearlyReward = (targetAPY / 100) * totalLiquidity;

  if (yearlyFees === 0) {
    return 0;
  }

  const requiredShare = targetYearlyReward / yearlyFees;
  const optimalAmount = requiredShare * totalLiquidity;

  return Math.max(0, optimalAmount);
}

export function calculateImpermanentLoss(
  initialPrice: number,
  currentPrice: number
): number {
  if (initialPrice === 0 || currentPrice === 0) {
    return 0;
  }

  const priceRatio = currentPrice / initialPrice;
  const sqrtRatio = Math.sqrt(priceRatio);

  const impermanentLoss =
    (2 * sqrtRatio) / (1 + priceRatio) - 1;

  return Math.abs(impermanentLoss) * 100;
}

export function calculateNetReturn(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number,
  initialPrice: number,
  currentPrice: number,
  daysHeld: number
): number {
  const rewards = calculateRewardProjection(
    liquidityAmount,
    totalLiquidity,
    dailyVolume
  );

  const totalRewards = rewards.dailyReward * daysHeld;

  const impermanentLoss = calculateImpermanentLoss(initialPrice, currentPrice);
  const impermanentLossAmount = (liquidityAmount * impermanentLoss) / 100;

  const netReturn = totalRewards - impermanentLossAmount;

  return netReturn;
}

export function formatRewardAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  } else if (amount >= 1) {
    return amount.toFixed(2);
  } else {
    return amount.toFixed(6);
  }
}

export function formatAPY(apy: number): string {
  if (apy >= 1000) {
    return `${(apy / 1000).toFixed(2)}K%`;
  } else if (apy >= 100) {
    return `${apy.toFixed(0)}%`;
  } else if (apy >= 1) {
    return `${apy.toFixed(2)}%`;
  } else {
    return `${apy.toFixed(4)}%`;
  }
}
