/**
 * Recent Markets Component
 * 
 * Displays recently created markets on the landing page.
 */

import { Link } from 'react-router-dom';
import { useMarkets } from '../hooks/useMarkets';
import { formatBlocksToTime } from '../utils/marketValidation';

export function RecentMarkets() {
  const { markets, isLoading } = useMarkets();
  
  // Get 3 most recent markets
  const recentMarkets = markets
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#9CA3AF',
      }}>
        Loading recent markets...
      </div>
    );
  }

  if (recentMarkets.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#FFFFFF', 
          marginBottom: '12px' 
        }}>
          No Markets Yet
        </h3>
        <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
          Be the first to create a prediction market!
        </p>
        <Link 
          to="/create-market"
          style={{
            padding: '12px 24px',
            backgroundColor: '#3B82F6',
            border: 'none',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Create First Market
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {recentMarkets.map((market) => {
        const totalStake = market.totalYesStake + market.totalNoStake;
        const blocksRemaining = market.endDate - Date.now() / 1000;
        
        return (
          <Link
            key={market.id}
            to={`/trade/${market.id}`}
            style={{
              display: 'block',
              padding: '20px',
              backgroundColor: '#0A0A0A',
              border: '1px solid #1F1F1F',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                }}>
                  {market.question}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6B7280',
                }}>
                  {formatBlocksToTime(Math.floor(blocksRemaining / 600))} remaining
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
            }}>
              <span style={{ color: '#9CA3AF' }}>
                Volume: {totalStake.toLocaleString()} STX
              </span>
              <span style={{ 
                color: '#3B82F6',
                fontWeight: '600',
              }}>
                View Market →
              </span>
            </div>
          </Link>
        );
      })}
      
      <Link 
        to="/markets"
        style={{
          display: 'block',
          padding: '16px',
          backgroundColor: 'transparent',
          border: '1px dashed #374151',
          borderRadius: '10px',
          textAlign: 'center',
          color: '#9CA3AF',
          fontSize: '14px',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
      >
        View All Markets
      </Link>
    </div>
  );
}
