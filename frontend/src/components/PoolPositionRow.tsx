import { Link } from 'react-router-dom';
import type { LPPosition, PendingRewards } from '../types/liquidity';
import { formatStxAmount } from '../types/liquidity';

interface PoolPositionRowProps {
  position: LPPosition;
  pendingRewards?: PendingRewards | null;
  onAddLiquidity?: () => void;
  onRemoveLiquidity?: () => void;
  onClaimRewards?: () => void;
}

/**
 * Compact row component for displaying LP positions in tables
 * Shows pool info, user's share, value, and pending rewards with quick actions
 */
export function PoolPositionRow({
  position,
  pendingRewards,
  onAddLiquidity,
  onRemoveLiquidity,
  onClaimRewards,
}: PoolPositionRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
      {/* Pool Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">LP</span>
        </div>
        <div className="min-w-0">
          <Link
            to={`/trade/${position.marketId}`}
            className="text-white font-medium hover:text-blue-400 transition-colors truncate block"
          >
            Pool #{position.marketId}
          </Link>
          <p className="text-sm text-neutral-500 truncate">
            Market #{position.marketId}
          </p>
        </div>
      </div>

      {/* User Share */}
      <div className="text-right px-4 hidden sm:block">
        <p className="text-white font-medium">
          {formatStxAmount(position.shares)} LP
        </p>
        <p className="text-sm text-neutral-500">
          {position.sharePercentage.toFixed(2)}% share
        </p>
      </div>

      {/* User Value */}
      <div className="text-right px-4">
        <p className="text-emerald-400 font-medium">
          {formatStxAmount(position.estimatedValue)} STX
        </p>
        <p className="text-sm text-neutral-500">Value</p>
      </div>

      {/* Pending Rewards */}
      {pendingRewards && pendingRewards.amount > 0n && (
        <div className="text-right px-4 hidden md:block">
          <p className="text-amber-400 font-medium">
            {formatStxAmount(pendingRewards.amount)} OXC
          </p>
          <p className="text-sm text-neutral-500">Rewards</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {pendingRewards && pendingRewards.amount > 0n && onClaimRewards && (
          <button
            onClick={onClaimRewards}
            className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors"
            title="Claim rewards"
          >
            Claim
          </button>
        )}
        {onAddLiquidity && (
          <button
            onClick={onAddLiquidity}
            className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors"
            title="Add liquidity"
          >
            +
          </button>
        )}
        {onRemoveLiquidity && (
          <button
            onClick={onRemoveLiquidity}
            className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
            title="Remove liquidity"
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for PoolPositionRow
 */
export function PoolPositionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-xl border border-neutral-800 animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-neutral-800" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-neutral-800 rounded" />
          <div className="h-3 w-16 bg-neutral-800 rounded" />
        </div>
      </div>
      <div className="space-y-2 px-4 hidden sm:block">
        <div className="h-4 w-20 bg-neutral-800 rounded" />
        <div className="h-3 w-12 bg-neutral-800 rounded ml-auto" />
      </div>
      <div className="space-y-2 px-4">
        <div className="h-4 w-20 bg-neutral-800 rounded" />
        <div className="h-3 w-12 bg-neutral-800 rounded ml-auto" />
      </div>
      <div className="flex gap-2">
        <div className="h-7 w-7 bg-neutral-800 rounded-lg" />
        <div className="h-7 w-7 bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Empty state for when user has no positions
 */
export function NoPositionsMessage() {
  return (
    <div className="text-center py-12 px-4 bg-neutral-900/30 rounded-xl border border-neutral-800/50">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center">
        <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No LP Positions</h3>
      <p className="text-neutral-400 mb-6 max-w-sm mx-auto">
        You don't have any liquidity positions yet. Add liquidity to a pool to start earning rewards.
      </p>
      <Link
        to="/liquidity"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Liquidity
      </Link>
    </div>
  );
}

/**
 * Summary card showing total LP value across all positions
 */
interface PositionsSummaryProps {
  totalValue: bigint;
  totalPositions: number;
  totalRewards: bigint;
}

export function PositionsSummary({ totalValue, totalPositions, totalRewards }: PositionsSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
      <div>
        <p className="text-sm text-neutral-400 mb-1">Total Value</p>
        <p className="text-xl font-bold text-white">{formatStxAmount(totalValue)} STX</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-neutral-400 mb-1">Positions</p>
        <p className="text-xl font-bold text-white">{totalPositions}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-neutral-400 mb-1">Pending Rewards</p>
        <p className="text-xl font-bold text-amber-400">{formatStxAmount(totalRewards)} OXC</p>
      </div>
    </div>
  );
}
