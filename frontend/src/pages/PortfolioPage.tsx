import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV, principalCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { useWallet } from '../components/WalletProvider';
import { useMarkets } from '../hooks/useMarkets';
import { useContract } from '../hooks/useContract';
import type { Market, Position } from '../types/market';
import { MarketStatus, MarketOutcome } from '../types/market';
import { parsePosition, formatStx, calculateOdds } from '../utils/helpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants';

interface PositionWithMarket extends Position {
  market: Market;
}

export function PortfolioPage() {
  const { isConnected, connect, address } = useWallet();
  const { markets, isLoading: marketsLoading } = useMarkets();
  const { claimWinnings } = useContract();
  const [positions, setPositions] = useState<PositionWithMarket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingMarketId, setClaimingMarketId] = useState<number | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPositions() {
      if (!address || markets.length === 0) {
        setPositions([]);
        return;
      }

      setIsLoading(true);
      const userPositions: PositionWithMarket[] = [];

      for (const market of markets) {
        try {
          const result = await fetchCallReadOnlyFunction({
            network: STACKS_MAINNET,
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-user-position',
            functionArgs: [uintCV(market.id), principalCV(address)],
            senderAddress: CONTRACT_ADDRESS,
          });

          const jsonResult = cvToJSON(result);
          if (jsonResult.type === 'some' && jsonResult.value) {
            const position = parsePosition(market.id, address, jsonResult.value);
            if (position.yesStake > 0 || position.noStake > 0) {
              userPositions.push({ ...position, market });
            }
          }
        } catch (err) {
          console.error(`Error fetching position for market ${market.id}:`, err);
        }
      }

      setPositions(userPositions);
      setIsLoading(false);
    }

    fetchPositions();
  }, [address, markets]);

  const refetchPositions = async () => {
    if (!address || markets.length === 0) return;
    
    const userPositions: PositionWithMarket[] = [];
    for (const market of markets) {
      try {
        const result = await fetchCallReadOnlyFunction({
          network: STACKS_MAINNET,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-user-position',
          functionArgs: [uintCV(market.id), principalCV(address)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const jsonResult = cvToJSON(result);
        if (jsonResult.type === 'some' && jsonResult.value) {
          const position = parsePosition(market.id, address, jsonResult.value);
          if (position.yesStake > 0 || position.noStake > 0) {
            userPositions.push({ ...position, market });
          }
        }
      } catch (err) {
        console.error(`Error fetching position for market ${market.id}:`, err);
      }
    }
    setPositions(userPositions);
  };

  const handleClaimWinnings = async (marketId: number) => {
    if (!isConnected || claimingMarketId) return;
    
    // Find the position to verify it hasn't been claimed
    const position = positions.find(p => p.marketId === marketId);
    if (!position || position.claimed) {
      setClaimError('This position has already been claimed');
      setTimeout(() => setClaimError(null), 5000);
      return;
    }
    
    setClaimingMarketId(marketId);
    setClaimError(null);
    setClaimSuccess(null);
    
    try {
      await claimWinnings(marketId);
      setClaimSuccess(marketId);
      
      // Refresh positions after successful claim
      setTimeout(() => {
        refetchPositions();
      }, 2000); // Wait 2s for blockchain to update
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setClaimSuccess(null), 5000);
    } catch (error) {
      console.error('Error claiming winnings:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim winnings');
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setClaimError(null), 5000);
    } finally {
      setClaimingMarketId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-neutral-500 mb-8">
            Connect your Stacks wallet to view your portfolio and track your positions.
          </p>
          <button type="button" onClick={() => connect()} className="btn btn-primary">Connect Wallet</button>
        </div>
      </div>
    );
  }

  if (marketsLoading || isLoading) {
    return (
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const totalStaked = positions.reduce((sum, p) => sum + p.yesStake + p.noStake, 0);
  const activePositions = positions.filter((p) => p.market.status === MarketStatus.ACTIVE);
  const wonPositions = positions.filter(
    (p) =>
      p.market.status === MarketStatus.RESOLVED &&
      ((p.yesStake > 0 && p.market.outcome === MarketOutcome.YES) ||
        (p.noStake > 0 && p.market.outcome === MarketOutcome.NO))
  );

  return (
    <div className="pt-[72px] min-h-screen">
      <div className="container py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Portfolio</h1>
          <p className="text-neutral-500">Track your positions and winnings</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-8 mb-12">
          <div className="card p-8">
            <p className="text-sm text-neutral-500 mb-3">Total Staked</p>
            <p className="text-2xl font-bold text-white">{formatStx(totalStaked)}</p>
          </div>
          <div className="card p-8">
            <p className="text-sm text-neutral-500 mb-3">Active Positions</p>
            <p className="text-2xl font-bold text-white">{activePositions.length}</p>
          </div>
          <div className="card p-8">
            <p className="text-sm text-neutral-500 mb-3">Winning Positions</p>
            <p className="text-2xl font-bold text-emerald-400">{wonPositions.length}</p>
          </div>
        </div>

        {/* Positions */}
        {positions.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-white mb-8">Your Positions</h2>
            
            <div className="space-y-6">
              {positions.map((position) => {
                const odds = calculateOdds(position.market.totalYesStake, position.market.totalNoStake);
                const isWinner =
                  position.market.status === MarketStatus.RESOLVED &&
                  ((position.yesStake > 0 && position.market.outcome === MarketOutcome.YES) ||
                    (position.noStake > 0 && position.market.outcome === MarketOutcome.NO));
                const isLoser = position.market.status === MarketStatus.RESOLVED && !isWinner;

                return (
                  <Link key={position.marketId} to={`/trade/${position.marketId}`} className="block group">
                    <div className={`card p-8 transition-all ${
                      isWinner ? 'border-emerald-500/30 bg-emerald-500/5' :
                      isLoser ? 'border-rose-500/30 bg-rose-500/5' : ''
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`badge ${
                              position.market.status === MarketStatus.ACTIVE ? 'badge-green' :
                              isWinner ? 'badge-green' : 'badge-blue'
                            }`}>
                              {position.market.status === MarketStatus.ACTIVE ? 'Active' : isWinner ? 'Won' : 'Resolved'}
                            </span>
                            <span className="text-xs text-neutral-500 font-mono">#{position.marketId}</span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-white mb-6 group-hover:text-blue-400 transition-colors">
                            {position.market.question}
                          </h3>

                          <div className="flex flex-wrap gap-8 text-sm">
                            {position.yesStake > 0 && (
                              <div>
                                <span className="text-emerald-400 font-medium">Yes: </span>
                                <span className="text-white">{formatStx(position.yesStake)}</span>
                                <span className="text-neutral-500 ml-1">({odds.yes}%)</span>
                              </div>
                            )}
                            {position.noStake > 0 && (
                              <div>
                                <span className="text-rose-400 font-medium">No: </span>
                                <span className="text-white">{formatStx(position.noStake)}</span>
                                <span className="text-neutral-500 ml-1">({odds.no}%)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <svg className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {isWinner && position.claimed && (
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                          <div className="p-3 bg-neutral-800 rounded-lg text-neutral-400 text-sm text-center">
                            ✓ Winnings already claimed
                          </div>
                        </div>
                      )}
                      
                      {isWinner && !position.claimed && (
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                          {claimSuccess === position.marketId && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                              ✓ Winnings claimed successfully! Transaction submitted.
                            </div>
                          )}
                          
                          {claimError && claimingMarketId === position.marketId && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                              ✗ {claimError}
                            </div>
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleClaimWinnings(position.marketId);
                            }}
                            disabled={claimingMarketId === position.marketId}
                            className="btn btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {claimingMarketId === position.marketId ? 'Claiming...' : 'Claim Winnings'}
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card p-24 text-center">
            <div className="w-24 h-24 mx-auto mb-10 rounded-full bg-neutral-900 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Positions Yet</h3>
            <p className="text-neutral-500 mb-6">Start trading to see your positions here</p>
            <Link to="/markets" className="btn btn-primary">Explore Markets</Link>
          </div>
        )}
      </div>
    </div>
  );
}
