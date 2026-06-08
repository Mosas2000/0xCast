/**
 * Analytics Hook
 * 
 * Fetch and compute analytics data from markets and blockchain
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMarkets } from './useMarkets';
import { useWallet } from '@/components/WalletProvider';
import { MarketStatus } from '@/types/market';
import { MarketOutcome } from '@/types/market';
import type {
  PlatformStats,
  MarketStats,
  VolumeDataPoint,
  CategoryData,
  UserActivityData,
  PersonalStats,
  TimeRange,
} from '@/types/analytics';
import {
  buildCategoryDistribution,
  buildMarketHealth,
  buildPredictiveInsights,
  buildUserActivity,
  buildVolumeHistory,
  getDaysFromTimeRange,
} from '@/utils/analytics';

export function useAnalytics(initialTimeRange: TimeRange = '30d') {
  const { markets, isLoading: marketsLoading } = useMarkets();
  const { address, isConnected } = useWallet();
  
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [isLoading, setIsLoading] = useState(true);

  // Compute platform stats from markets
  const platformStats = useMemo<PlatformStats | null>(() => {
    if (markets.length === 0) return null;
    
    const activeMarkets = markets.filter(m => m.status === MarketStatus.ACTIVE).length;
    const resolvedMarkets = markets.filter(m => m.status === MarketStatus.RESOLVED).length;
    
    let totalVolume = 0n;
    let totalPredictions = 0;
    
    markets.forEach(market => {
      totalVolume += BigInt(market.totalYesStake || 0) + BigInt(market.totalNoStake || 0);
      // Estimate predictions based on stake amounts
      totalPredictions += Math.max(1, Math.floor((market.totalYesStake + market.totalNoStake) / 1000000));
    });
    
    // Estimate fees (2% of volume)
    const totalFees = totalVolume * 2n / 100n;
    
    return {
      totalMarkets: markets.length,
      activeMarkets,
      resolvedMarkets,
      totalVolume,
      totalVolumeFormatted: (Number(totalVolume) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      totalUsers: Math.floor(totalPredictions * 0.7), // Estimate unique users
      totalPredictions,
      totalFeesCollected: totalFees,
      totalFeesFormatted: (Number(totalFees) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    };
  }, [markets]);

  // Compute top markets
  const topMarkets = useMemo<MarketStats[]>(() => {
    return markets
      .map(market => {
        const totalPool = BigInt(market.totalYesStake || 0) + BigInt(market.totalNoStake || 0);
        const totalPoolNum = Number(totalPool);
        const yesPoolNum = Number(market.totalYesStake || 0);
        const noPoolNum = Number(market.totalNoStake || 0);
        
        // Map numeric status to string
        let statusStr: 'active' | 'resolved' | 'disputed' = 'active';
        if (market.status === MarketStatus.RESOLVED) statusStr = 'resolved';
        else if (market.status === MarketStatus.DISPUTED) statusStr = 'disputed';
        
        // Map numeric outcome to string
        let outcomeStr: 'yes' | 'no' | null = null;
        if (market.outcome === MarketOutcome.YES) outcomeStr = 'yes';
        else if (market.outcome === MarketOutcome.NO) outcomeStr = 'no';
        
        return {
          id: market.id,
          question: market.question,
          totalPool,
          totalPoolFormatted: (totalPoolNum / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
          yesPool: BigInt(market.totalYesStake || 0),
          noPool: BigInt(market.totalNoStake || 0),
          yesPercentage: totalPoolNum > 0 ? (yesPoolNum / totalPoolNum) * 100 : 50,
          noPercentage: totalPoolNum > 0 ? (noPoolNum / totalPoolNum) * 100 : 50,
          predictorCount: Math.max(1, Math.floor((market.totalYesStake + market.totalNoStake) / 1000000)),
          createdAt: market.createdAt || 0,
          endBlock: market.endDate || 0,
          status: statusStr,
          outcome: outcomeStr,
        };
      })
      .sort((a, b) => Number(b.totalPool - a.totalPool))
      .slice(0, 10);
  }, [markets]);

  // Generate category distribution
  const categoryDistribution = useMemo<CategoryData[]>(() => buildCategoryDistribution(markets), [markets]);

  // Volume history derived from market creation and pool activity
  const volumeHistory = useMemo<VolumeDataPoint[]>(() => {
    const days = getDaysFromTimeRange(timeRange);
    return buildVolumeHistory(markets, days);
  }, [markets, timeRange]);

  // User activity inferred from transaction counts
  const userActivity = useMemo<UserActivityData[]>(() => {
    return buildUserActivity(volumeHistory);
  }, [volumeHistory]);

  const marketHealth = useMemo(() => buildMarketHealth(markets), [markets]);
  const predictiveInsights = useMemo(() => buildPredictiveInsights(markets), [markets]);

  // Personal stats (mock for now)
  const personalStats = useMemo<PersonalStats | null>(() => {
    if (!isConnected || !address) return null;
    
    // Mock personal stats
    return {
      totalPredictions: 12,
      totalStaked: 5000000n,
      totalStakedFormatted: '5.00',
      totalWinnings: 7500000n,
      totalWinningsFormatted: '7.50',
      totalLosses: 2000000n,
      totalLossesFormatted: '2.00',
      netPnL: 5500000n,
      netPnLFormatted: '5.50',
      winRate: 66.7,
      wins: 8,
      losses: 4,
      pendingPositions: 2,
      favoriteCategory: 'Crypto',
    };
  }, [isConnected, address]);

  // Update loading state
  useEffect(() => {
    setIsLoading(marketsLoading);
  }, [marketsLoading]);

  // Refresh function
  const refresh = useCallback(() => {
    setIsLoading(true);
    // Markets will auto-refresh
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return {
    // Data
    platformStats,
    topMarkets,
    volumeHistory,
    categoryDistribution,
    userActivity,
    personalStats,
    marketHealth,
    predictiveInsights,
    
    // State
    isLoading,
    timeRange,
    
    // Actions
    setTimeRange,
    refresh,
  };
}
