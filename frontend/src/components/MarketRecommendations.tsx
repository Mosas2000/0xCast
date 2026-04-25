import { useMemo } from 'react';
import { Market } from '../types/market';
import { MarketCard } from './MarketCard';

interface MarketRecommendationsProps {
  markets: Market[];
}

export function MarketRecommendations({ markets }: MarketRecommendationsProps) {
  const recommendations = useMemo(() => {
    // Recommendation logic: Top 3 by volume from active markets
    return [...markets]
      .filter(m => m.status === 'active')
      .sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake))
      .slice(0, 3);
  }, [markets]);

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
        gap: 32
      }}>
        {recommendations.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}
