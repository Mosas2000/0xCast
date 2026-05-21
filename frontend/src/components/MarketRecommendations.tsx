import { useMemo } from 'react';
import { Market } from '@/types/market';
import { MarketCard } from './MarketCard';

interface MarketRecommendationsProps {
  markets: Market[];
  isLoading?: boolean;
}

export function MarketRecommendations({ markets, isLoading }: MarketRecommendationsProps) {
  const recommendations = useMemo(() => {
    // Recommendation logic: Top 3 by volume from active markets
    return [...markets]
      .filter(m => m.status === 'active')
      .sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake))
      .slice(0, 3);
  }, [markets]);

  if (isLoading) {
    return (
      <div style={{ marginBottom: 48 }}>
        <div style={{ height: 32, width: 250, background: '#222', borderRadius: 8, marginBottom: 24 }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 280, background: '#111', border: '1px solid #262626', borderRadius: 20 }} />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
          Recommended for You
        </h2>
        <span style={{ 
          padding: '4px 10px', 
          backgroundColor: '#3B82F620', 
          border: '1px solid #3B82F640', 
          borderRadius: 20, 
          fontSize: 12, 
          color: '#3B82F6',
          fontWeight: 600
        }}>
          TRENDING
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        marginBottom: 48
      }}>
        {recommendations.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
          Popular Categories
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {['Crypto', 'DeFi', 'Sports', 'Politics'].map(cat => (
            <div key={cat} style={{
              padding: '12px 20px',
              background: '#111',
              border: '1px solid #262626',
              borderRadius: 12,
              color: '#A3A3A3',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{cat === 'Crypto' ? '₿' : cat === 'DeFi' ? '🏦' : cat === 'Sports' ? '⚽' : '🏛️'}</span>
              {cat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
