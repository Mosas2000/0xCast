/**
 * TradePage - MVP Version
 * Displays market details (trading functionality to be implemented)
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';
import type { Market } from '@/types/market';
import { MarketStatus } from '@/types/market';
import { parseMarketData, calculateOdds, formatStx, getStatusLabel } from '@/utils/helpers';
import { useWallet } from '@/components/WalletProvider';
import { useNetwork } from '@/contexts/NetworkContext';
import { MARKET_CONTRACT } from '@/config/contracts';
import { LoadingState } from '@/components/Loading';
import { getExplorerAddressUrl, getExplorerUrl } from '@/utils/transactions';
import { useMarketStaking } from '@/hooks/useMarketStaking';

export function TradePage() {
  const { id } = useParams<{ id: string }>();
  const marketId = id ? parseInt(id, 10) : null;
  
  const { isConnected, connect } = useWallet();
  const { network, stacksNetwork } = useNetwork();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { placeStake, isLoading: isStaking, error: stakingError, txId, reset: resetStaking } = useMarketStaking();
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');

  // Fetch market data from contract

  const fetchMarket = useCallback(async () => {
    if (marketId === null || isNaN(marketId)) {
      setError('Invalid market ID');
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchCallReadOnlyFunction({
        network: stacksNetwork,
        contractAddress: MARKET_CONTRACT.address,
        contractName: MARKET_CONTRACT.name,
        functionName: 'get-market',
        functionArgs: [uintCV(marketId)],
        senderAddress: MARKET_CONTRACT.address,
      });

      const jsonResult = cvToJSON(result);
      const isSome = jsonResult.type === 'some' || (typeof jsonResult.type === 'string' && jsonResult.type.startsWith('(optional') && jsonResult.value !== null);
      if (isSome && jsonResult.value) {
        setMarket(parseMarketData(marketId, jsonResult.value));
      } else {
        setError('Market not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market');
    } finally {
      setIsLoading(false);
    }
  }, [marketId, stacksNetwork]);

  // Initial market data fetch on mount
  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  if (isLoading) {
    return <LoadingState message="Loading market..." />;
  }

  if (error || !market) {
    return (
      <div style={{ paddingTop: 120, minHeight: '100vh', background: '#000' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            {error || 'Market Not Found'}
          </h2>
          <p style={{ fontSize: 16, color: '#737373', marginBottom: 32 }}>
            The market you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link 
            to="/markets"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: '#3b82f6',
              color: '#fff',
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const odds = calculateOdds(market.totalYesStake || 0, market.totalNoStake || 0);
  const totalVolume = (market.totalYesStake || 0) + (market.totalNoStake || 0);
  const isActive = market.status === MarketStatus.ACTIVE;
  const isResolved = market.resolved;

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* Back Link */}
        <Link 
          to="/markets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#737373',
            textDecoration: 'none',
            marginBottom: 32,
            fontSize: 14
          }}
        >
          <span>←</span> Back to Markets
        </Link>

        {/* Market Header */}
        <div style={{
          background: '#111',
          borderRadius: 20,
          border: '1px solid #262626',
          padding: 40,
          marginBottom: 32
        }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 9999,
              background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(161, 161, 170, 0.15)',
              color: isActive ? '#22c55e' : '#a1a1aa',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 16
            }}>
              {getStatusLabel(market.status || MarketStatus.ACTIVE)}
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.3 }}>
            {market.question}
          </h1>

          {market.description && (
            <p style={{ fontSize: 16, color: '#a3a3a3', marginBottom: 24, lineHeight: 1.6 }}>
              {market.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 12, color: '#737373', marginBottom: 4 }}>Total Volume</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                {formatStx(totalVolume, 2)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#737373', marginBottom: 4 }}>YES Stake</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: '#22c55e' }}>
                {formatStx(market.totalYesStake || 0, 2)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#737373', marginBottom: 4 }}>NO Stake</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: '#ef4444' }}>
                {formatStx(market.totalNoStake || 0, 2)}
              </p>
            </div>
          </div>
        </div>

        {/* Odds Display */}
        <div style={{
          background: '#111',
          borderRadius: 20,
          border: '1px solid #262626',
          padding: 40,
          marginBottom: 32
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 24 }}>
            Current Odds
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{
              padding: 24,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 16
            }}>
              <p style={{ fontSize: 14, color: '#86efac', marginBottom: 8 }}>YES</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#22c55e' }}>
                {odds.yes.toFixed(1)}%
              </p>
            </div>
            
            <div style={{
              padding: 24,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 16
            }}>
              <p style={{ fontSize: 14, color: '#fca5a5', marginBottom: 8 }}>NO</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#ef4444' }}>
                {odds.no.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Trading Section */}
        <div style={{
          background: '#111',
          borderRadius: 20,
          border: '1px solid #262626',
          padding: 40
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 24 }}>
            Place Your Prediction
          </h2>

          {!isConnected ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: 16, color: '#737373', marginBottom: 24 }}>
                Connect your wallet to start trading
              </p>
              <button 
                type="button"
                onClick={() => connect()}
                style={{
                  padding: '14px 32px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                Connect Wallet
              </button>
            </div>
          ) : !isActive ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: 16, color: '#737373' }}>
                This market is {isResolved ? 'resolved' : 'not active'}
              </p>
            </div>
          ) : txId ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 16,
              padding: '32px 24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28
              }}>
                🎉
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                Prediction Submitted!
              </h3>
              <p style={{ fontSize: 14, color: '#a3a3a3', marginBottom: 24, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
                Your prediction has been broadcasted to the Stacks network. It can take up to a few blocks (~10–30 seconds) to be confirmed.
              </p>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getExplorerUrl(txId, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: '#fff',
                    borderRadius: 8,
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'background 0.2s'
                  }}
                >
                  View on Explorer ↗
                </a>
                <button
                  type="button"
                  onClick={() => {
                    resetStaking();
                    setSelectedOutcome(null);
                    setStakeAmount('');
                    fetchMarket(); // Refresh details
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  Place Another Prediction
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedOutcome || !stakeAmount || marketId === null) return;
              const amount = parseFloat(stakeAmount);
              if (isNaN(amount) || amount <= 0) return;
              await placeStake({
                marketId,
                outcome: selectedOutcome,
                amountStx: amount
              });
            }}>
              {stakingError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 8,
                  padding: 16,
                  color: '#ef4444',
                  fontSize: 14,
                  marginBottom: 24,
                  lineHeight: 1.5
                }}>
                  ⚠️ {stakingError}
                </div>
              )}

              {/* Outcome Selection */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 12, fontWeight: 500 }}>
                  Select Outcome
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome('yes');
                      if (stakingError) resetStaking();
                    }}
                    style={{
                      padding: '20px',
                      background: selectedOutcome === 'yes' ? 'rgba(34, 197, 94, 0.08)' : '#1a1a1a',
                      border: selectedOutcome === 'yes' ? '2px solid #22c55e' : '1px solid #333',
                      borderRadius: 12,
                      color: selectedOutcome === 'yes' ? '#22c55e' : '#fff',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <span style={{ fontSize: 18 }}>👍</span> YES
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutcome('no');
                      if (stakingError) resetStaking();
                    }}
                    style={{
                      padding: '20px',
                      background: selectedOutcome === 'no' ? 'rgba(239, 68, 68, 0.08)' : '#1a1a1a',
                      border: selectedOutcome === 'no' ? '2px solid #ef4444' : '1px solid #333',
                      borderRadius: 12,
                      color: selectedOutcome === 'no' ? '#ef4444' : '#fff',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <span style={{ fontSize: 18 }}>👎</span> NO
                  </button>
                </div>
              </div>

              {/* Input Staking Amount */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label htmlFor="stake-amount" style={{ fontSize: 13, color: '#a3a3a3', fontWeight: 500 }}>
                    Stake Amount (STX)
                  </label>
                  <span style={{ fontSize: 12, color: '#737373' }}>
                    Min: 1 micro-STX
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="stake-amount"
                    type="number"
                    step="any"
                    placeholder="Enter STX amount..."
                    value={stakeAmount}
                    onChange={(e) => {
                      setStakeAmount(e.target.value);
                      if (stakingError) resetStaking();
                    }}
                    disabled={isStaking}
                    style={{
                      width: '100%',
                      padding: '16px 64px 16px 16px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 16,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#737373',
                    fontWeight: 600,
                    fontSize: 14,
                    pointerEvents: 'none'
                  }}>
                    STX
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isStaking || !selectedOutcome || !stakeAmount}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: (!selectedOutcome || !stakeAmount) ? '#1a1a1a' : '#3b82f6',
                  color: (!selectedOutcome || !stakeAmount) ? '#525252' : '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: (!selectedOutcome || !stakeAmount) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isStaking ? (
                  <>
                    <span className="animate-spin" style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      border: '2px solid currentcolor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%'
                    }} />
                    Confirming in Wallet...
                  </>
                ) : (
                  `Place Prediction on ${selectedOutcome ? selectedOutcome.toUpperCase() : '...'}`
                )}
              </button>
            </form>
          )}
        </div>

        {/* Market Details */}
        <div style={{
          background: '#111',
          borderRadius: 20,
          border: '1px solid #262626',
          padding: 40,
          marginTop: 32
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 24 }}>
            Market Details
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #262626' }}>
              <span style={{ color: '#737373', fontSize: 14 }}>Market ID</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>#{market.id}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #262626' }}>
              <span style={{ color: '#737373', fontSize: 14 }}>Creator</span>
              <a 
                href={getExplorerAddressUrl(market.creator, network)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}
              >
                {market.creator.slice(0, 8)}...{market.creator.slice(-6)}
              </a>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #262626' }}>
              <span style={{ color: '#737373', fontSize: 14 }}>Status</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                {getStatusLabel(market.status || MarketStatus.ACTIVE)}
              </span>
            </div>
            
            {isResolved && market.outcome !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#737373', fontSize: 14 }}>Resolution</span>
                <span style={{ 
                  color: market.outcome === 1 ? '#22c55e' : '#ef4444', 
                  fontSize: 14, 
                  fontWeight: 600 
                }}>
                  {market.outcome === 1 ? 'YES' : 'NO'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
