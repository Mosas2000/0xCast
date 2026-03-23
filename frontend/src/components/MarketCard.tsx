import { Link } from 'react-router-dom';
import type { Market } from '../types/market';
import { MarketStatus } from '../types/market';
import { calculateOdds, formatStx, getStatusLabel } from '../utils/helpers';

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const odds = calculateOdds(market.totalYesStake, market.totalNoStake);
  const totalPool = market.totalYesStake + market.totalNoStake;
  const isActive = market.status === MarketStatus.ACTIVE;

  return (
    <Link to={`/trade/${market.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={{
        height: '100%',
        padding: 32,
        background: '#111',
        borderRadius: 20,
        border: '1px solid #262626',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: 9999,
            background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: isActive ? '#4ade80' : '#60a5fa',
            fontSize: 12,
            fontWeight: 600
          }}>
            {getStatusLabel(market.status)}
          </span>
          <span style={{ fontSize: 12, color: '#525252', fontFamily: 'monospace' }}>
            #{market.id}
          </span>
        </div>

        {/* Question */}
        <h3 style={{
          fontSize: 17,
          fontWeight: 600,
          color: '#fff',
          lineHeight: 1.5,
          marginBottom: 24,
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {market.question}
        </h3>

        {/* Odds */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>Yes {odds.yes}%</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f87171' }}>No {odds.no}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: '#262626', display: 'flex', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#22c55e', width: `${odds.yes}%`, transition: 'width 0.3s' }} />
            <div style={{ height: '100%', background: '#ef4444', width: `${odds.no}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: 20,
          borderTop: '1px solid #262626'
        }}>
          <div>
            <p style={{ fontSize: 12, color: '#525252', marginBottom: 4 }}>Total Pool</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{formatStx(totalPool)}</p>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>

          </span>
        </div>
      </div>
    </Link>
  );
}
