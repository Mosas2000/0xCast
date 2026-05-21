/**
 * OraclePage Component
 * 
 * Dashboard for oracle management, market resolutions, and disputes.
 * Provides admin controls and user dispute functionality.
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { useOracle } from '@/hooks/useOracle';
import { useOracleActions } from '@/hooks/useOracleActions';
import type { OracleStats, MarketResolution, Dispute } from '@/types/oracle';
import { formatDisputeStatus, getDisputeStatusColor, formatBlocksToTime, DISPUTE_STATUS } from '@/types/oracle';

// Tabs for the oracle dashboard
type TabType = 'overview' | 'oracles' | 'resolutions' | 'disputes' | 'admin';

export function OraclePage() {
  const { isConnected, address, connect } = useWallet();
  const { settings, isLoading, error, checkIsOracle, getOracleStats } = useOracle();
  const { state: actionState } = useOracleActions();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isUserOracle, setIsUserOracle] = useState(false);
  const [userOracleStats, setUserOracleStats] = useState<OracleStats | null>(null);

  // Check if current user is an oracle
  useEffect(() => {
    if (address) {
      checkIsOracle(address).then(setIsUserOracle);
      getOracleStats(address).then(setUserOracleStats);
    }
  }, [address, checkIsOracle, getOracleStats]);

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oracle Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to access oracle management and dispute resolution.
            </p>
            <button
              onClick={connect}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Oracle Dashboard</h1>
        <p className="text-gray-400">
          Manage oracles, view resolutions, and participate in disputes
        </p>
      </div>

      {/* User Oracle Status Banner */}
      {isUserOracle && (
        <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">You are a registered Oracle</p>
              <p className="text-purple-300 text-sm">
                {userOracleStats?.totalResolutions ?? 0} resolutions • {userOracleStats?.reliability ?? 100}% reliability
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 overflow-x-auto">
        {(['overview', 'oracles', 'resolutions', 'disputes', 'admin'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium capitalize whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <OverviewTab settings={settings} isLoading={isLoading} />
        )}
        {activeTab === 'oracles' && (
          <OraclesTab />
        )}
        {activeTab === 'resolutions' && (
          <ResolutionsTab />
        )}
        {activeTab === 'disputes' && (
          <DisputesTab />
        )}
        {activeTab === 'admin' && (
          <AdminTab />
        )}
      </div>

      {/* Global Error Display */}
      {(error || actionState.error) && (
        <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error || actionState.error}</p>
        </div>
      )}
    </div>
  );
}

// ==================== Overview Tab ====================

interface OverviewTabProps {
  settings: ReturnType<typeof useOracle>['settings'];
  isLoading: boolean;
}

function OverviewTab({ settings, isLoading }: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Oracle Settings Card */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Oracle Settings</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Dispute Period</span>
            <span className="text-white">{formatBlocksToTime(settings?.disputePeriod ?? 144)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Voting Period</span>
            <span className="text-white">{formatBlocksToTime(settings?.votingPeriod ?? 288)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Min Dispute Stake</span>
            <span className="text-white">
              {Number(settings?.minDisputeStake ?? 5000000n) / 1_000_000} STX
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dispute Quorum</span>
            <span className="text-white">{settings?.disputeQuorum ?? 3} votes</span>
          </div>
        </div>
      </div>

      {/* How It Works Card */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">How Oracles Work</h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex gap-2">
            <span className="text-purple-400 font-bold">1.</span>
            <span>Oracles submit price feeds or resolutions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-bold">2.</span>
            <span>Resolution enters dispute period</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-bold">3.</span>
            <span>Users can dispute with stake</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-bold">4.</span>
            <span>Community votes on disputes</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400 font-bold">5.</span>
            <span>Resolution finalized after period</span>
          </li>
        </ol>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Stats</h3>
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <p className="text-3xl font-bold text-purple-400">—</p>
            <p className="text-sm text-gray-400">Active Oracles</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <p className="text-xl font-bold text-green-400">—</p>
              <p className="text-xs text-gray-400">Resolutions</p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <p className="text-xl font-bold text-yellow-400">—</p>
              <p className="text-xs text-gray-400">Disputes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Oracles Tab ====================

function OraclesTab() {
  const { getOracleStats } = useOracle();
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResult, setSearchResult] = useState<OracleStats | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    try {
      const stats = await getOracleStats(searchAddress);
      setSearchResult(stats);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Oracle */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Look Up Oracle</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Enter oracle address (SP...)"
            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchAddress.trim()}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${searchResult.isRegistered ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-white font-medium">
                {searchResult.isRegistered ? 'Registered Oracle' : 'Not Registered'}
              </span>
            </div>
            {searchResult.isRegistered && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{searchResult.totalResolutions}</p>
                  <p className="text-sm text-gray-400">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{searchResult.successfulResolutions}</p>
                  <p className="text-sm text-gray-400">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{searchResult.reliability}%</p>
                  <p className="text-sm text-gray-400">Reliability</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Oracle Info */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">About Oracles</h3>
        <div className="prose prose-invert max-w-none text-gray-400">
          <p>
            Oracles are trusted entities that submit external data to resolve prediction markets.
            They play a crucial role in ensuring accurate and fair market outcomes.
          </p>
          <ul className="mt-4 space-y-2">
            <li>• Oracles must be registered by the contract owner</li>
            <li>• They can submit price feeds and market resolutions</li>
            <li>• Their performance is tracked (success rate, disputes)</li>
            <li>• Poor performance can lead to removal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==================== Resolutions Tab ====================

function ResolutionsTab() {
  const { getMarketResolution, isInDisputePeriod, isResolutionFinalized } = useOracle();
  const [marketId, setMarketId] = useState('');
  const [resolution, setResolution] = useState<MarketResolution | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [inDispute, setInDispute] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const handleLookup = async () => {
    const id = parseInt(marketId);
    if (isNaN(id) || id < 0) return;

    setIsLooking(true);
    try {
      const [res, dispute, final] = await Promise.all([
        getMarketResolution(id),
        isInDisputePeriod(id),
        isResolutionFinalized(id),
      ]);
      setResolution(res);
      setInDispute(dispute);
      setFinalized(final);
    } catch (err) {
      console.error('Lookup failed:', err);
    } finally {
      setIsLooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lookup Resolution */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Look Up Resolution</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            placeholder="Enter market ID"
            min="0"
            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleLookup}
            disabled={isLooking || !marketId}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLooking ? 'Looking...' : 'Look Up'}
          </button>
        </div>

        {/* Resolution Result */}
        {resolution && (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Market #{marketId}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                finalized 
                  ? 'bg-green-500/20 text-green-400' 
                  : inDispute 
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
              }`}>
                {finalized ? 'Finalized' : inDispute ? 'In Dispute Period' : 'Pending'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Result</p>
                <p className={`text-lg font-bold ${resolution.result === 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {resolution.result === 1 ? 'YES' : 'NO'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Resolved At</p>
                <p className="text-lg font-medium text-white">Block #{resolution.resolvedAt}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Oracle</p>
                <p className="text-white font-mono text-sm break-all">{resolution.oracle}</p>
              </div>
            </div>
          </div>
        )}

        {marketId && !resolution && !isLooking && (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg text-center">
            <p className="text-gray-400">No resolution found for this market</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Disputes Tab ====================

function DisputesTab() {
  const { address } = useWallet();
  const { getDispute, getDisputeVote, settings } = useOracle();
  const { submitDispute, voteOnDispute, resolveDispute, state } = useOracleActions();
  
  const [marketId, setMarketId] = useState('');
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [userVote, setUserVote] = useState<{ vote: number; weight: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dispute form state
  const [reason, setReason] = useState('');
  const [stake, setStake] = useState('');

  const handleLookup = async () => {
    const id = parseInt(marketId);
    if (isNaN(id) || id < 0) return;

    setIsLoading(true);
    try {
      const [disputeData, voteData] = await Promise.all([
        getDispute(id),
        address ? getDisputeVote(id, address) : null,
      ]);
      setDispute(disputeData);
      setUserVote(voteData);
    } catch (err) {
      console.error('Lookup failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    const id = parseInt(marketId);
    const stakeAmount = BigInt(Math.floor(parseFloat(stake) * 1_000_000));
    
    if (isNaN(id) || !reason.trim() || stakeAmount <= 0n) return;
    
    try {
      await submitDispute(id, reason, stakeAmount);
      // Refresh dispute data
      handleLookup();
      setReason('');
      setStake('');
    } catch (err) {
      console.error('Submit dispute failed:', err);
    }
  };

  const handleVote = async (vote: 1 | 2) => {
    const id = parseInt(marketId);
    if (isNaN(id)) return;
    
    try {
      await voteOnDispute(id, vote);
      handleLookup();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleResolve = async () => {
    const id = parseInt(marketId);
    if (isNaN(id)) return;
    
    try {
      await resolveDispute(id);
      handleLookup();
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  };

  const minStake = Number(settings?.minDisputeStake ?? 5000000n) / 1_000_000;

  return (
    <div className="space-y-6">
      {/* Lookup Dispute */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Look Up Dispute</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            placeholder="Enter market ID"
            min="0"
            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleLookup}
            disabled={isLoading || !marketId}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Look Up'}
          </button>
        </div>

        {/* Dispute Result */}
        {dispute && (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Dispute #{dispute.disputeId}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getDisputeStatusColor(dispute.status)} bg-opacity-20`}>
                {formatDisputeStatus(dispute.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Stake</p>
                <p className="text-white font-medium">{Number(dispute.stake) / 1_000_000} STX</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Votes</p>
                <p className="text-white">
                  <span className="text-green-400">{dispute.yesVotes} Yes</span>
                  {' / '}
                  <span className="text-red-400">{dispute.noVotes} No</span>
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Reason</p>
              <p className="text-white">{dispute.reason}</p>
            </div>

            {/* Vote Buttons */}
            {dispute.status === DISPUTE_STATUS.ACTIVE && !userVote && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleVote(1)}
                  disabled={state.isSubmitting}
                  className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Vote Yes
                </button>
                <button
                  onClick={() => handleVote(2)}
                  disabled={state.isSubmitting}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Vote No
                </button>
              </div>
            )}

            {userVote && (
              <div className="pt-2 text-center text-gray-400">
                You voted: <span className={userVote.vote === 1 ? 'text-green-400' : 'text-red-400'}>
                  {userVote.vote === 1 ? 'Yes' : 'No'}
                </span>
              </div>
            )}

            {/* Resolve Button */}
            {dispute.status === DISPUTE_STATUS.ACTIVE && (
              <button
                onClick={handleResolve}
                disabled={state.isSubmitting}
                className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Resolve Dispute
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submit New Dispute */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Submit New Dispute</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Market ID</label>
            <input
              type="number"
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              placeholder="Market ID to dispute"
              min="0"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Reason for Dispute</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you believe the resolution is incorrect..."
              rows={3}
              maxLength={256}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">{reason.length}/256 characters</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Stake Amount (STX)</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder={`Minimum ${minStake} STX`}
              min={minStake}
              step="0.1"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Stake is returned if dispute is upheld, partially slashed if rejected
            </p>
          </div>
          <button
            onClick={handleSubmitDispute}
            disabled={state.isSubmitting || !marketId || !reason.trim() || parseFloat(stake) < minStake}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {state.isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== Admin Tab ====================

function AdminTab() {
  const {
    registerOracle,
    removeOracle,
    configureOracleSource,
    setDisputePeriod,
    setVotingPeriod,
    setMinDisputeStake,
    withdrawSlashed,
    state,
  } = useOracleActions();

  // Form states
  const [oracleAddress, setOracleAddress] = useState('');
  const [sourceMarketId, setSourceMarketId] = useState('');
  const [oracleType, setOracleType] = useState('');
  const [dataFeed, setDataFeed] = useState('');
  const [thresholdPrice, setThresholdPrice] = useState('');
  const [newDisputePeriod, setNewDisputePeriod] = useState('');
  const [newVotingPeriod, setNewVotingPeriod] = useState('');
  const [newMinStake, setNewMinStake] = useState('');

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-400 text-sm">
            Admin functions are restricted to the contract owner. Unauthorized transactions will fail.
          </p>
        </div>
      </div>

      {/* Oracle Management */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Oracle Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Oracle Address</label>
            <input
              type="text"
              value={oracleAddress}
              onChange={(e) => setOracleAddress(e.target.value)}
              placeholder="SP... or ST..."
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => registerOracle(oracleAddress)}
              disabled={state.isSubmitting || !oracleAddress}
              className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Register
            </button>
            <button
              onClick={() => removeOracle(oracleAddress)}
              disabled={state.isSubmitting || !oracleAddress}
              className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Configure Oracle Source */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configure Oracle Source</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Market ID</label>
            <input
              type="number"
              value={sourceMarketId}
              onChange={(e) => setSourceMarketId(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Oracle Type</label>
            <input
              type="text"
              value={oracleType}
              onChange={(e) => setOracleType(e.target.value)}
              placeholder="price-feed"
              maxLength={20}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Data Feed</label>
            <input
              type="text"
              value={dataFeed}
              onChange={(e) => setDataFeed(e.target.value)}
              placeholder="BTC/USD"
              maxLength={100}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Threshold Price</label>
            <input
              type="number"
              value={thresholdPrice}
              onChange={(e) => setThresholdPrice(e.target.value)}
              placeholder="100000"
              min="0"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <button
          onClick={() => configureOracleSource(
            parseInt(sourceMarketId),
            oracleType,
            dataFeed,
            parseInt(thresholdPrice)
          )}
          disabled={state.isSubmitting || !sourceMarketId || !oracleType || !dataFeed || !thresholdPrice}
          className="mt-4 w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Configure Source
        </button>
      </div>

      {/* Settings */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Update Settings</h3>
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Dispute Period (blocks)</label>
              <input
                type="number"
                value={newDisputePeriod}
                onChange={(e) => setNewDisputePeriod(e.target.value)}
                placeholder="144"
                min="1"
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setDisputePeriod(parseInt(newDisputePeriod))}
              disabled={state.isSubmitting || !newDisputePeriod}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg"
            >
              Update
            </button>
          </div>
          
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Voting Period (blocks)</label>
              <input
                type="number"
                value={newVotingPeriod}
                onChange={(e) => setNewVotingPeriod(e.target.value)}
                placeholder="288"
                min="1"
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setVotingPeriod(parseInt(newVotingPeriod))}
              disabled={state.isSubmitting || !newVotingPeriod}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg"
            >
              Update
            </button>
          </div>
          
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Min Dispute Stake (STX)</label>
              <input
                type="number"
                value={newMinStake}
                onChange={(e) => setNewMinStake(e.target.value)}
                placeholder="5"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setMinDisputeStake(BigInt(Math.floor(parseFloat(newMinStake) * 1_000_000)))}
              disabled={state.isSubmitting || !newMinStake}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Slashed */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Treasury</h3>
        <button
          onClick={withdrawSlashed}
          disabled={state.isSubmitting}
          className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Withdraw Slashed Stakes
        </button>
      </div>
    </div>
  );
}
