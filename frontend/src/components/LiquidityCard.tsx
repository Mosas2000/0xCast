/**
 * LiquidityCard Component
 * 
 * Displays liquidity pool information and user position.
 */

import type { LiquidityPool, LPPosition } from '../types/liquidity';
import { formatStxAmount, calculateSharePercentage } from '../types/liquidity';

interface LiquidityCardProps {
  pool: LiquidityPool;
  position?: LPPosition | null;
  marketQuestion?: string;
  onAddLiquidity?: () => void;
  onRemoveLiquidity?: () => void;
  onClaimRewards?: () => void;
  pendingRewards?: bigint;
}

export function LiquidityCard({
  pool,
  position,
  marketQuestion,
  onAddLiquidity,
  onRemoveLiquidity,
  onClaimRewards,
  pendingRewards = 0n,
}: LiquidityCardProps) {
  const hasPosition = position && position.shares > 0n;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Pool #{pool.marketId}</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            pool.active 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            {pool.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        {marketQuestion && (
          <h3 className="text-white font-medium">{marketQuestion}</h3>
        )}
      </div>

      {/* Pool Stats */}
      <div className="p-5 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Value Locked</p>
            <p className="text-xl font-bold text-white">{formatStxAmount(pool.stxBalance)} STX</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total LP Shares</p>
            <p className="text-xl font-bold text-purple-400">{formatStxAmount(pool.totalShares)}</p>
          </div>
        </div>
      </div>

      {/* User Position */}
      {hasPosition && (
        <div className="p-5 bg-purple-500/10 border-b border-gray-700">
          <h4 className="text-sm font-medium text-purple-300 mb-3">Your Position</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500">Shares</p>
              <p className="text-white font-medium">{formatStxAmount(position.shares)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pool Share</p>
              <p className="text-white font-medium">{position.sharePercentage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Value</p>
              <p className="text-white font-medium">{formatStxAmount(position.estimatedValue)} STX</p>
            </div>
          </div>

          {/* Pending Rewards */}
          {pendingRewards > 0n && (
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400">Pending Rewards</p>
                  <p className="text-lg font-bold text-yellow-300">{formatStxAmount(pendingRewards)} OXC</p>
                </div>
                {onClaimRewards && (
                  <button
                    onClick={onClaimRewards}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-5 flex gap-3">
        {onAddLiquidity && (
          <button
            onClick={onAddLiquidity}
            className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            Add Liquidity
          </button>
        )}
        {hasPosition && onRemoveLiquidity && (
          <button
            onClick={onRemoveLiquidity}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * LiquidityCardSkeleton Component
 */
export function LiquidityCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 animate-pulse">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-20 bg-gray-700 rounded" />
          <div className="h-5 w-16 bg-gray-700 rounded" />
        </div>
        <div className="h-5 w-48 bg-gray-700 rounded" />
      </div>
      <div className="p-5 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
            <div className="h-6 w-20 bg-gray-700 rounded" />
          </div>
          <div>
            <div className="h-3 w-20 bg-gray-700 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="h-10 bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * PoolStatsCard Component
 * 
 * Compact pool statistics display.
 */
interface PoolStatsCardProps {
  pool: LiquidityPool;
  apy?: number;
  volume24h?: bigint;
}

export function PoolStatsCard({ pool, apy = 0, volume24h = 0n }: PoolStatsCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">TVL</p>
          <p className="text-white font-medium">{formatStxAmount(pool.stxBalance)} STX</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">24h Volume</p>
          <p className="text-white font-medium">{formatStxAmount(volume24h)} STX</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">APY</p>
          <p className="text-green-400 font-medium">{apy.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p className={pool.active ? 'text-green-400' : 'text-gray-400'}>
            {pool.active ? 'Active' : 'Paused'}
          </p>
        </div>
      </div>
    </div>
  );
}
