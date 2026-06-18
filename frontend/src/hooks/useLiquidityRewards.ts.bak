import { useState, useEffect, useCallback } from 'react';
import {
  calculateRewardProjection,
  calculateAPY,
  estimateRewardsByVolume,
  calculateHistoricalAPY,
  type RewardCalculation,
  type MarketVolume,
} from '@/utils/liquidityRewardsCalculator';
import { liquidityRewardsService } from '@/services/LiquidityRewardsService';
import { useWallet } from '@/components/WalletProvider';

interface UseLiquidityRewardsReturn {
  calculateRewards: (
    liquidityAmount: number,
    totalLiquidity: number,
    dailyVolume: number
  ) => RewardCalculation;
  calculateAPYEstimate: (
    liquidityAmount: number,
    totalLiquidity: number,
    dailyVolume: number
  ) => number;
  getHistoricalRewards: () => { date: string; amount: number }[];
  getTotalRewards: () => number;
  getHistoricalAPY: (periodDays: number) => number;
  estimateByVolume: (
    liquidityAmount: number,
    totalLiquidity: number,
    volume: MarketVolume
  ) => {
    based24h: RewardCalculation;
    based7d: RewardCalculation;
    based30d: RewardCalculation;
  };
  isLoading: boolean;
  error: string | null;
}

export function useLiquidityRewards(
  marketId?: number
): UseLiquidityRewardsReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRewards = useCallback(
    (
      liquidityAmount: number,
      totalLiquidity: number,
      dailyVolume: number
    ): RewardCalculation => {
      try {
        return calculateRewardProjection(
          liquidityAmount,
          totalLiquidity,
          dailyVolume
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation failed');
        return {
          dailyReward: 0,
          weeklyReward: 0,
          monthlyReward: 0,
          yearlyReward: 0,
          apy: 0,
          estimatedValue: 0,
        };
      }
    },
    []
  );

  const calculateAPYEstimate = useCallback(
    (
      liquidityAmount: number,
      totalLiquidity: number,
      dailyVolume: number
    ): number => {
      try {
        return calculateAPY(liquidityAmount, totalLiquidity, dailyVolume);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'APY calculation failed');
        return 0;
      }
    },
    []
  );

  const getHistoricalRewards = useCallback((): {
    date: string;
    amount: number;
  }[] => {
    if (!address) return [];

    try {
      return liquidityRewardsService.getRewardHistory(address, 30);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch historical rewards'
      );
      return [];
    }
  }, [address]);

  const getTotalRewards = useCallback((): number => {
    if (!address) return 0;

    try {
      if (marketId !== undefined) {
        const rewards = liquidityRewardsService.getRewardsByMarket(
          address,
          marketId
        );
        return rewards.reduce((sum, reward) => sum + reward.amount, 0);
      }
      return liquidityRewardsService.getTotalRewards(address);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch total rewards'
      );
      return 0;
    }
  }, [address, marketId]);

  const getHistoricalAPY = useCallback(
    (periodDays: number): number => {
      if (!address) return 0;

      try {
        const rewards = marketId !== undefined
          ? liquidityRewardsService.getRewardsByMarket(address, marketId)
          : liquidityRewardsService.getRewards(address);

        const positions = marketId !== undefined
          ? liquidityRewardsService.getPositionsByMarket(address, marketId)
          : liquidityRewardsService.getPositions(address);

        const totalLiquidity = positions.reduce(
          (sum, pos) => sum + pos.amount,
          0
        );

        return calculateHistoricalAPY(rewards, totalLiquidity, periodDays);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to calculate historical APY'
        );
        return 0;
      }
    },
    [address, marketId]
  );

  const estimateByVolume = useCallback(
    (
      liquidityAmount: number,
      totalLiquidity: number,
      volume: MarketVolume
    ) => {
      try {
        return estimateRewardsByVolume(liquidityAmount, totalLiquidity, volume);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Volume estimation failed'
        );
        return {
          based24h: {
            dailyReward: 0,
            weeklyReward: 0,
            monthlyReward: 0,
            yearlyReward: 0,
            apy: 0,
            estimatedValue: 0,
          },
          based7d: {
            dailyReward: 0,
            weeklyReward: 0,
            monthlyReward: 0,
            yearlyReward: 0,
            apy: 0,
            estimatedValue: 0,
          },
          based30d: {
            dailyReward: 0,
            weeklyReward: 0,
            monthlyReward: 0,
            yearlyReward: 0,
            apy: 0,
            estimatedValue: 0,
          },
        };
      }
    },
    []
  );

  return {
    calculateRewards,
    calculateAPYEstimate,
    getHistoricalRewards,
    getTotalRewards,
    getHistoricalAPY,
    estimateByVolume,
    isLoading,
    error,
  };
}
