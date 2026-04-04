import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import type { Market } from '../types/market';
import { MarketStatus, MarketOutcome } from '../types/market';
import { parseMarketData, calculateOdds, formatStx, getStatusLabel, formatAddress } from '../utils/helpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME, MIN_STAKE, MAX_STAKE } from '../constants';
import { useWallet } from '../components/WalletProvider';
import { useStake } from '../hooks/useStake';

export function TradePage() {
  const { id } = useParams<{ id: string }>();
  const marketId = id ? parseInt(id, 10) : null;
  
  const { isConnected, connect } = useWallet();
  const { placeYesStake, placeNoStake, isLoading: isStaking, error: stakeError, txId } = useStake();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('10');

  useEffect(() => {
    async function fetchMarket() {
      if (marketId === null) {
        setError('Invalid market ID');
        setIsLoading(false);
        return;
      }

      try {
        const result = await fetchCallReadOnlyFunction({
          network: STACKS_MAINNET,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-market',
          functionArgs: [uintCV(marketId)],
          senderAddress: CONTRACT_ADDRESS,
        });

        const jsonResult = cvToJSON(result);
        if (jsonResult.type === 'some' && jsonResult.value) {
          setMarket(parseMarketData(marketId, jsonResult.value));
        } else {
          setError('Market not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarket();
  }, [marketId]);

  const handleTrade = async () => {
    if (!market || !selectedOutcome || !stakeAmount) return;
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount < MIN_STAKE || amount > MAX_STAKE) return;

    const onSuccess = () => {
      window.location.reload();
    };

    if (selectedOutcome === 'yes') {
      await placeYesStake(market.id, amount, onSuccess);
    } else {
      await placeNoStake(market.id, amount, onSuccess);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500">Loading market...</p>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Market Not Found</h2>
          <p className="text-neutral-500 mb-6">{error || "The market you're looking for doesn't exist."}</p>
          <Link to="/markets" className="btn btn-primary">Back to Markets</Link>
        </div>
      </div>
    );
  }

  const odds = calculateOdds(market.totalYesStake, market.totalNoStake);
  const totalPool = market.totalYesStake + market.totalNoStake;
  const isActive = market.status === MarketStatus.ACTIVE;
  const isResolved = market.status === MarketStatus.RESOLVED;

  const stake = parseFloat(stakeAmount) || 0;
  const potentialWinYes = stake > 0 && odds.yes > 0 ? (stake / odds.yes) * 100 : 0;
  const potentialWinNo = stake > 0 && odds.no > 0 ? (stake / odds.no) * 100 : 0;

  return (
    <div className="pt-[72px] min-h-screen">
      <div className="container max-w-5xl py-12 lg:py-16">
        {/* Back */}
        <Link to="/markets" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-10 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Markets
        </Link>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`badge ${isActive ? 'badge-green' : 'badge-blue'}`}>
                {getStatusLabel(market.status)}
              </span>
              <span className="text-sm text-neutral-500 font-mono">#{market.id}</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              {market.question}
            </h1>

            {/* Resolved */}
            {isResolved && (
              <div className={`p-6 rounded-xl ${
                market.outcome === MarketOutcome.YES 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-rose-500/10 border border-rose-500/20'
              }`}>
                <p className="text-sm text-neutral-400 mb-2">Outcome</p>
                <p className={`text-2xl font-bold ${
                  market.outcome === MarketOutcome.YES ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {market.outcome === MarketOutcome.YES ? 'YES' : 'NO'}
                </p>
              </div>
            )}

            {/* Odds */}
            <div className="card p-8">
              <h3 className="text-sm font-medium text-neutral-400 mb-8">Current Odds</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-emerald-400 font-semibold">Yes</span>
                    <span className="text-white font-bold">{odds.yes}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${odds.yes}%` }} />
                  </div>
                  <p className="text-xs text-neutral-500 mt-3">{formatStx(market.totalYesStake)} staked</p>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-rose-400 font-semibold">No</span>
                    <span className="text-white font-bold">{odds.no}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all" style={{ width: `${odds.no}%` }} />
                  </div>
                  <p className="text-xs text-neutral-500 mt-3">{formatStx(market.totalNoStake)} staked</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-800 flex justify-between">
                <span className="text-neutral-500">Total Pool</span>
                <span className="text-white font-bold">{formatStx(totalPool)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="card p-8">
              <h3 className="text-sm font-medium text-neutral-400 mb-6">Market Details</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Creator</span>
                  <a
                    href={`https://explorer.hiro.so/address/${market.creator}?chain=mainnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-mono text-sm"
                  >
                    {formatAddress(market.creator)}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created</span>
                  <span className="text-white">Block {market.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ends</span>
                  <span className="text-white">Block {market.endDate.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-2">
            <div className="card p-8 lg:sticky lg:top-[88px]">
              <h3 className="text-lg font-semibold text-white mb-8">
                {isActive ? 'Place Your Prediction' : 'Trading Closed'}
              </h3>

              {!isConnected ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-6">Connect your wallet to trade</p>
                  <button type="button" onClick={() => connect()} className="btn btn-primary w-full">Connect Wallet</button>
                </div>
              ) : !isActive ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">This market is no longer accepting trades</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Outcome Selection */}
                  <div>
                    <label className="block text-sm text-neutral-400 mb-4">Select Outcome</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedOutcome('yes')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedOutcome === 'yes'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className="block text-xl font-bold text-emerald-400">Yes</span>
                        <span className="text-xs text-neutral-500">{odds.yes}%</span>
                      </button>
                      <button
                        onClick={() => setSelectedOutcome('no')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedOutcome === 'no'
                            ? 'border-rose-500 bg-rose-500/10'
                            : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className="block text-xl font-bold text-rose-400">No</span>
                        <span className="text-xs text-neutral-500">{odds.no}%</span>
                      </button>
                    </div>
                  </div>

                  {/* Stake Amount */}
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Amount (STX)</label>
                    <input
                      type="number"
                      min={MIN_STAKE}
                      max={MAX_STAKE}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[10, 50, 100, 500].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setStakeAmount(amount.toString())}
                          className="py-2 text-xs rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Potential */}
                  {selectedOutcome && stake > 0 && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                      <p className="text-sm text-neutral-400 mb-1">Potential Return</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedOutcome === 'yes' ? potentialWinYes.toFixed(2) : potentialWinNo.toFixed(2)} STX
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">If {selectedOutcome.toUpperCase()} wins</p>
                    </div>
                  )}

                  {/* Error */}
                  {stakeError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {stakeError}
                    </div>
                  )}

                  {/* Success */}
                  {txId && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                      Transaction submitted!{' '}
                      <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank" rel="noopener noreferrer" className="underline">
                        View on Explorer
                      </a>
                    </div>
                  )}

                  {/* Trade Button */}
                  <button
                    onClick={handleTrade}
                    disabled={!selectedOutcome || !stakeAmount || isStaking || stake < MIN_STAKE}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedOutcome === 'yes' ? 'bg-emerald-600 hover:bg-emerald-500' :
                      selectedOutcome === 'no' ? 'bg-rose-600 hover:bg-rose-500' :
                      'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    {isStaking ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : selectedOutcome ? (
                      `Stake on ${selectedOutcome.toUpperCase()}`
                    ) : (
                      'Select an outcome'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
