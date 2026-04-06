import { useState, useEffect, useMemo } from 'react';
import type { LiquidityPool, LPPosition, PendingRewards } from '../types/liquidity';
import { formatStxAmount, calculateAPY, calculateSharePercentage } from '../types/liquidity';

interface LiquidityStatsProps {
  pools: LiquidityPool[];
  positions: LPPosition[];
  pendingRewards: PendingRewards[];
}

/**
 * Analytics dashboard component for liquidity providers
 * Shows key metrics, charts, and performance indicators
 */
export function LiquidityStats({ pools, positions, pendingRewards }: LiquidityStatsProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Calculate total protocol TVL
  const totalTVL = useMemo(() => {
    return pools.reduce((sum, pool) => sum + pool.totalLiquidity, 0);
  }, [pools]);

  // Calculate user's total value locked
  const userTVL = useMemo(() => {
    return positions.reduce((sum, pos) => {
      const shareRatio = pos.poolTotalShares > 0 
        ? pos.lpBalance / pos.poolTotalShares 
        : 0;
      return sum + Math.floor(shareRatio * pos.poolTotalLiquidity);
    }, 0);
  }, [positions]);

  // Calculate total pending rewards
  const totalPendingRewards = useMemo(() => {
    return pendingRewards.reduce((sum, r) => sum + r.amount, 0);
  }, [pendingRewards]);

  // Calculate average APY across positions
  const averageAPY = useMemo(() => {
    if (positions.length === 0) return 0;
    const totalAPY = positions.reduce((sum, pos) => {
      return sum + calculateAPY(pos.poolTotalLiquidity, pos.poolTotalLiquidity * 0.05);
    }, 0);
    return totalAPY / positions.length;
  }, [positions]);

  // Calculate portfolio distribution
  const portfolioDistribution = useMemo(() => {
    if (userTVL === 0) return [];
    return positions.map(pos => {
      const shareRatio = pos.poolTotalShares > 0 
        ? pos.lpBalance / pos.poolTotalShares 
        : 0;
      const value = Math.floor(shareRatio * pos.poolTotalLiquidity);
      const percentage = (value / userTVL) * 100;
      return {
        poolId: pos.poolId,
        marketId: pos.marketId,
        value,
        percentage,
      };
    }).sort((a, b) => b.value - a.value);
  }, [positions, userTVL]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Liquidity Analytics</h3>
        <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Protocol TVL"
          value={formatStxAmount(totalTVL)}
          unit="STX"
          trend={+5.2}
          trendLabel="vs last period"
        />
        <MetricCard
          label="Your TVL"
          value={formatStxAmount(userTVL)}
          unit="STX"
          trend={userTVL > 0 ? +2.1 : 0}
          trendLabel="vs last period"
        />
        <MetricCard
          label="Pending Rewards"
          value={formatStxAmount(totalPendingRewards)}
          unit="OXC"
          trend={totalPendingRewards > 0 ? +12.5 : 0}
          trendLabel="accrued"
        />
        <MetricCard
          label="Avg APY"
          value={averageAPY.toFixed(1)}
          unit="%"
          trend={0}
          trendLabel="estimated"
        />
      </div>

      {/* Portfolio Distribution */}
      {positions.length > 0 && (
        <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
          <h4 className="text-sm font-medium text-neutral-400 mb-4">Portfolio Distribution</h4>
          <div className="space-y-3">
            {portfolioDistribution.slice(0, 5).map((item) => (
              <div key={item.poolId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Pool #{item.poolId}</span>
                  <span className="text-neutral-400">
                    {formatStxAmount(item.value)} STX ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {portfolioDistribution.length > 5 && (
              <p className="text-sm text-neutral-500 text-center pt-2">
                +{portfolioDistribution.length - 5} more positions
              </p>
            )}
          </div>
        </div>
      )}

      {/* TVL Chart Placeholder */}
      <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
        <h4 className="text-sm font-medium text-neutral-400 mb-4">TVL Over Time</h4>
        <TVLChart timeRange={timeRange} currentTVL={userTVL} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <QuickStat
          label="Active Pools"
          value={pools.filter(p => p.totalLiquidity > 0).length.toString()}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          }
        />
        <QuickStat
          label="Your Positions"
          value={positions.length.toString()}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <QuickStat
          label="LP Share"
          value={positions.length > 0 ? `${(userTVL / totalTVL * 100).toFixed(2)}%` : '0%'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  trend: number;
  trendLabel: string;
}

function MetricCard({ label, value, unit, trend, trendLabel }: MetricCardProps) {
  return (
    <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-4">
      <p className="text-sm text-neutral-400 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">
        {value} <span className="text-sm text-neutral-500">{unit}</span>
      </p>
      {trend !== 0 && (
        <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}% {trendLabel}
        </p>
      )}
    </div>
  );
}

interface QuickStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function QuickStat({ label, value, icon }: QuickStatProps) {
  return (
    <div className="flex items-center gap-3 bg-neutral-900/30 rounded-lg p-3 border border-neutral-800/50">
      <div className="text-blue-400">{icon}</div>
      <div>
        <p className="text-lg font-semibold text-white">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

interface TVLChartProps {
  timeRange: '24h' | '7d' | '30d';
  currentTVL: number;
}

function TVLChart({ timeRange, currentTVL }: TVLChartProps) {
  // Generate mock data points for visualization
  const dataPoints = useMemo(() => {
    const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const data: number[] = [];
    let value = currentTVL * 0.8; // Start at 80% of current

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.4) * 0.1; // Slight upward bias
      value = Math.max(0, value * (1 + change));
      data.push(value);
    }
    // End at current value
    data[data.length - 1] = currentTVL;
    return data;
  }, [timeRange, currentTVL]);

  const maxValue = Math.max(...dataPoints, 1);
  const minValue = Math.min(...dataPoints);

  return (
    <div className="h-40 flex items-end gap-1">
      {dataPoints.map((value, index) => {
        const height = maxValue > 0 ? ((value - minValue) / (maxValue - minValue)) * 100 : 0;
        return (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t opacity-70 hover:opacity-100 transition-opacity cursor-pointer group relative"
            style={{ height: `${Math.max(height, 5)}%` }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap pointer-events-none">
              {formatStxAmount(value)} STX
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Loading skeleton for LiquidityStats
 */
export function LiquidityStatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 w-40 bg-neutral-800 rounded" />
        <div className="h-8 w-32 bg-neutral-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-4">
            <div className="h-4 w-20 bg-neutral-800 rounded mb-2" />
            <div className="h-8 w-24 bg-neutral-800 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6 h-48" />
    </div>
  );
}
