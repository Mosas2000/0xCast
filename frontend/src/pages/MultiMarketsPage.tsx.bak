import { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { useMultiMarkets } from '@/hooks/useMultiMarkets';
import { useRealtimeSignal } from '@/hooks/useRealtimeSignal';
import { formatAddress, formatStx } from '@/utils/helpers';

export function MultiMarketsPage() {
  const { markets, isLoading, error, refetch } = useMultiMarkets();
  const { signal, source, isSocketConnected } = useRealtimeSignal({ enabled: true });
  const [lastUpdatedAt, refreshLastUpdatedAt] = useReducer(() => new Date(), new Date());

  useEffect(() => {
    if (signal === 0) {
      return;
    }
    refetch();
    refreshLastUpdatedAt();
  }, [signal, refetch]);

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
              <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>Multi-Outcome Markets</h1>
              <p style={{ fontSize: 18, color: '#737373', marginTop: 12 }}>
                Trade across markets with three or more outcomes.
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>
                Live updates: {isSocketConnected ? 'Connected' : 'Polling'} via {source} • Last update {lastUpdatedAt.toLocaleTimeString()}
              </p>
            </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={refetch}
              disabled={isLoading}
              style={{
                padding: '12px 20px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 10,
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link
              to="/create-multi-market"
              style={{
                padding: '12px 20px',
                background: '#2563EB',
                borderRadius: 10,
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Create Multi Market
            </Link>
          </div>
        </div>

        {isLoading && <p style={{ color: '#737373' }}>Loading markets...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {!isLoading && !error && markets.length === 0 && (
          <div style={{ color: '#9CA3AF', border: '1px solid #1F1F1F', borderRadius: 12, padding: 24 }}>
            No multi-outcome markets available.
          </div>
        )}

        <div style={{ display: 'grid', gap: 20 }}>
          {markets.map((market) => {
            const totalPool = market.outcomes.reduce((sum, outcome) => sum + outcome.stake, 0);
            return (
              <Link
                key={market.id}
                to={`/multi-trade/${market.id}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  border: '1px solid #1F1F1F',
                  borderRadius: 16,
                  padding: 24,
                  background: '#0A0A0A',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{market.question}</h3>
                  <span style={{ color: '#9CA3AF', fontSize: 13 }}>#{market.id}</span>
                </div>

                <p style={{ color: '#9CA3AF', marginBottom: 16 }}>Creator: {formatAddress(market.creator)}</p>

                <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                  {market.outcomes.map((outcome) => (
                    <div key={outcome.index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D1D5DB', marginBottom: 4 }}>
                        <span>{outcome.name}</span>
                        <span>{outcome.percentage}%</span>
                      </div>
                      <div style={{ height: 8, background: '#1F2937', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${outcome.percentage}%`, height: '100%', background: '#3B82F6' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ color: '#93C5FD', fontWeight: 600, margin: 0 }}>Total Pool: {formatStx(totalPool)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
