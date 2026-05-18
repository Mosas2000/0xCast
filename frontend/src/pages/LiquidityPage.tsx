/**
 * LiquidityPage Component
 * 
 * Dashboard for liquidity pool management and LP rewards.
 * Allows users to provide liquidity, track positions, and claim rewards.
 */

import { useState, useEffect } from 'react';
import { useWallet } from '../components/WalletProvider';
import { useLiquidity } from '../hooks/useLiquidity';
import { useLiquidityActions } from '../hooks/useLiquidityActions';
import { useLiquidityRewards } from '../hooks/useLiquidityRewards';
import { LiquidityCard, LiquidityCardSkeleton } from '../components/LiquidityCard';
import type { LiquidityPool, LPPosition, PendingRewards } from '../types/liquidity';
import { formatStxAmount, validateLiquidityAmount } from '../types/liquidity';

type TabType = 'pools' | 'positions' | 'rewards';

export function LiquidityPage() {
  const { isConnected, address, connect } = useWallet();
  const { getPool, getLPPosition } = useLiquidity();
  const { addLiquidity, removeLiquidity, state: actionState, resetState: resetActionState } = useLiquidityActions();
  const { getPendingRewards, claimRewards, state: rewardsState } = useLiquidityRewards();

  const [activeTab, setActiveTab] = useState<TabType>('pools');
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [rewards, setRewards] = useState<PendingRewards[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<LPPosition | null>(null);

  // Load pools and user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load pools (in production, get list from indexer or iterate)
      const poolsData: LiquidityPool[] = [];
      const positionsData: LPPosition[] = [];
      const rewardsData: PendingRewards[] = [];
      
      // Sample: try to load first 5 pools
      for (let i = 0; i < 5; i++) {
        const pool = await getPool(i);
        if (pool && pool.active) {
          poolsData.push(pool);
          
          if (address) {
            const position = await getLPPosition(i, address);
            if (position && position.shares > 0n) {
              positionsData.push(position);
            }
            
            const pending = await getPendingRewards(i, address);
            if (pending && pending.amount > 0n) {
              rewardsData.push(pending);
            }
          }
        }
      }
      
      setPools(poolsData);
      setPositions(positionsData);
      setRewards(rewardsData);
      setIsLoading(false);
    };

    loadData();
  }, [address, getPool, getLPPosition, getPendingRewards]);

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Liquidity Pools</h2>
            <p className="text-gray-400 mb-6">
              Provide liquidity to prediction markets and earn rewards from trading fees.
            </p>
            <button
              onClick={connect}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddLiquidity = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setShowAddModal(true);
  };

  const handleRemoveLiquidity = (position: LPPosition) => {
    const pool = pools.find(p => p.marketId === position.marketId);
    if (pool) {
      setSelectedPool(pool);
      setSelectedPosition(position);
      setShowRemoveModal(true);
    }
  };

  const handleClaimRewards = async (marketId: number) => {
    try {
      await claimRewards(marketId);
    } catch (err) {
      console.error('Failed to claim rewards:', err);
    }
  };

  const totalPositionValue = positions.reduce((sum, p) => sum + p.estimatedValue, 0n);
  const totalPendingRewards = rewards.reduce((sum, r) => sum + r.amount, 0n);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Liquidity Pools</h1>
        <p className="text-gray-400">
          Provide liquidity to earn trading fees and OXC rewards
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Your Liquidity</p>
          <p className="text-2xl font-bold text-white">{formatStxAmount(totalPositionValue)} STX</p>
          <p className="text-sm text-gray-500 mt-1">{positions.length} active position{positions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Pending Rewards</p>
          <p className="text-2xl font-bold text-yellow-400">{formatStxAmount(totalPendingRewards)} OXC</p>
          <p className="text-sm text-gray-500 mt-1">From {rewards.length} pool{rewards.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Active Pools</p>
          <p className="text-2xl font-bold text-blue-400">{pools.length}</p>
          <p className="text-sm text-gray-500 mt-1">Available for liquidity</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {(['pools', 'positions', 'rewards'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
            {tab === 'positions' && positions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {positions.length}
              </span>
            )}
            {tab === 'rewards' && rewards.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                {rewards.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <LiquidityCardSkeleton key={i} />)}
          </div>
        ) : activeTab === 'pools' ? (
          <PoolsTab
            pools={pools}
            positions={positions}
            rewards={rewards}
            onAddLiquidity={handleAddLiquidity}
            onRemoveLiquidity={handleRemoveLiquidity}
            onClaimRewards={handleClaimRewards}
          />
        ) : activeTab === 'positions' ? (
          <PositionsTab
            positions={positions}
            pools={pools}
            rewards={rewards}
            onRemoveLiquidity={handleRemoveLiquidity}
            onClaimRewards={handleClaimRewards}
          />
        ) : (
          <RewardsTab
            rewards={rewards}
            onClaimRewards={handleClaimRewards}
            isClaiming={rewardsState.isClaiming}
          />
        )}
      </div>

      {/* Add Liquidity Modal */}
      {showAddModal && selectedPool && (
        <AddLiquidityModal
          pool={selectedPool}
          onClose={() => {
            setShowAddModal(false);
            setSelectedPool(null);
            resetActionState();
          }}
          onSubmit={async (amount) => {
            await addLiquidity(selectedPool.marketId, amount);
            setShowAddModal(false);
            setSelectedPool(null);
          }}
          isSubmitting={actionState.isSubmitting}
          error={actionState.error}
        />
      )}

      {/* Remove Liquidity Modal */}
      {showRemoveModal && selectedPool && selectedPosition && (
        <RemoveLiquidityModal
          pool={selectedPool}
          position={selectedPosition}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedPool(null);
            setSelectedPosition(null);
            resetActionState();
          }}
          onSubmit={async (shares) => {
            await removeLiquidity(selectedPool.marketId, shares);
            setShowRemoveModal(false);
            setSelectedPool(null);
            setSelectedPosition(null);
          }}
          isSubmitting={actionState.isSubmitting}
          error={actionState.error}
        />
      )}
    </div>
  );
}

// ==================== Pools Tab ====================

interface PoolsTabProps {
  pools: LiquidityPool[];
  positions: LPPosition[];
  rewards: PendingRewards[];
  onAddLiquidity: (pool: LiquidityPool) => void;
  onRemoveLiquidity: (position: LPPosition) => void;
  onClaimRewards: (marketId: number) => void;
}

function PoolsTab({ pools, positions, rewards, onAddLiquidity, onRemoveLiquidity, onClaimRewards }: PoolsTabProps) {
  if (pools.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Active Pools</h3>
        <p className="text-gray-400 text-sm">
          No liquidity pools are currently available. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pools.map(pool => {
        const position = positions.find(p => p.marketId === pool.marketId);
        const pendingReward = rewards.find(r => r.marketId === pool.marketId);
        
        return (
          <LiquidityCard
            key={pool.marketId}
            pool={pool}
            position={position}
            pendingRewards={pendingReward?.amount}
            onAddLiquidity={() => onAddLiquidity(pool)}
            onRemoveLiquidity={position ? () => onRemoveLiquidity(position) : undefined}
            onClaimRewards={pendingReward?.claimable ? () => onClaimRewards(pool.marketId) : undefined}
          />
        );
      })}
    </div>
  );
}

// ==================== Positions Tab ====================

interface PositionsTabProps {
  positions: LPPosition[];
  pools: LiquidityPool[];
  rewards: PendingRewards[];
  onRemoveLiquidity: (position: LPPosition) => void;
  onClaimRewards: (marketId: number) => void;
}

function PositionsTab({ positions, pools, rewards, onRemoveLiquidity, onClaimRewards }: PositionsTabProps) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Positions</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          You haven't provided liquidity to any pools yet. Add liquidity to start earning rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map(position => {
        const pool = pools.find(p => p.marketId === position.marketId);
        const pendingReward = rewards.find(r => r.marketId === position.marketId);
        
        if (!pool) return null;
        
        return (
          <div key={position.marketId} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-gray-400">Pool #{position.marketId}</span>
                <p className="text-white font-medium">Your LP Position</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">{formatStxAmount(position.estimatedValue)} STX</p>
                <p className="text-sm text-gray-400">{position.sharePercentage.toFixed(2)}% of pool</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Your Shares</p>
                <p className="text-white">{formatStxAmount(position.shares)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pool TVL</p>
                <p className="text-white">{formatStxAmount(pool.stxBalance)} STX</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pool Shares</p>
                <p className="text-white">{formatStxAmount(pool.totalShares)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending Rewards</p>
                <p className="text-yellow-400">{formatStxAmount(pendingReward?.amount ?? 0n)} OXC</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => onRemoveLiquidity(position)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Remove Liquidity
              </button>
              {pendingReward?.claimable && (
                <button
                  onClick={() => onClaimRewards(position.marketId)}
                  className="px-6 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg font-medium transition-colors"
                >
                  Claim Rewards
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== Rewards Tab ====================

interface RewardsTabProps {
  rewards: PendingRewards[];
  onClaimRewards: (marketId: number) => void;
  isClaiming: boolean;
}

function RewardsTab({ rewards, onClaimRewards, isClaiming }: RewardsTabProps) {
  const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0n);
  
  if (rewards.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Pending Rewards</h3>
        <p className="text-gray-400 text-sm">
          Provide liquidity to start earning OXC rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Rewards Card */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-400 mb-1">Total Pending Rewards</p>
            <p className="text-3xl font-bold text-white">{formatStxAmount(totalRewards)} OXC</p>
            <p className="text-sm text-gray-400 mt-1">From {rewards.length} pool{rewards.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => rewards.forEach(r => r.claimable && onClaimRewards(r.marketId))}
            disabled={isClaiming}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black rounded-lg font-medium transition-colors"
          >
            {isClaiming ? 'Claiming...' : 'Claim All'}
          </button>
        </div>
      </div>

      {/* Individual Rewards */}
      <div className="space-y-3">
        {rewards.map(reward => (
          <div key={reward.marketId} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Pool #{reward.marketId}</p>
              <p className="text-sm text-gray-400">Pending rewards</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xl font-bold text-yellow-400">{formatStxAmount(reward.amount)} OXC</p>
              <button
                onClick={() => onClaimRewards(reward.marketId)}
                disabled={isClaiming || !reward.claimable}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-50 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
              >
                Claim
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Add Liquidity Modal ====================

interface AddLiquidityModalProps {
  pool: LiquidityPool;
  onClose: () => void;
  onSubmit: (amount: bigint) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function AddLiquidityModal({ pool, onClose, onSubmit, isSubmitting, error }: AddLiquidityModalProps) {
  const [amount, setAmount] = useState('');
  const validation = validateLiquidityAmount(amount);

  const handleSubmit = async () => {
    if (!validation.isValid) return;
    const microAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
    await onSubmit(microAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Liquidity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Pool #{pool.marketId}</p>
          <p className="text-gray-300">Current TVL: {formatStxAmount(pool.stxBalance)} STX</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount (STX)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {!validation.isValid && amount && (
            <p className="text-red-400 text-sm mt-1">{validation.error}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !validation.isValid || !amount}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? 'Adding Liquidity...' : 'Add Liquidity'}
        </button>
      </div>
    </div>
  );
}

// ==================== Remove Liquidity Modal ====================

interface RemoveLiquidityModalProps {
  pool: LiquidityPool;
  position: LPPosition;
  onClose: () => void;
  onSubmit: (shares: bigint) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function RemoveLiquidityModal({ pool, position, onClose, onSubmit, isSubmitting, error }: RemoveLiquidityModalProps) {
  const [percentage, setPercentage] = useState(100);
  
  const sharesToRemove = (position.shares * BigInt(percentage)) / 100n;
  const estimatedReturn = (sharesToRemove * pool.stxBalance) / pool.totalShares;

  const handleSubmit = async () => {
    if (sharesToRemove <= 0n) return;
    await onSubmit(sharesToRemove);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Remove Liquidity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Your Position</p>
          <p className="text-white">{formatStxAmount(position.shares)} shares ({position.sharePercentage.toFixed(2)}% of pool)</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount to Remove: {percentage}%</label>
          <input
            type="range"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            min="1"
            max="100"
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            {[25, 50, 75, 100].map(p => (
              <button
                key={p}
                onClick={() => setPercentage(p)}
                className={`px-3 py-1 rounded text-sm ${
                  percentage === p 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Shares to Remove</span>
            <span className="text-white">{formatStxAmount(sharesToRemove)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Estimated Return</span>
            <span className="text-green-400">{formatStxAmount(estimatedReturn)} STX</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || sharesToRemove <= 0n}
          className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? 'Removing...' : 'Remove Liquidity'}
        </button>
      </div>
    </div>
  );
}
