import { useState } from 'react';
import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from '../components/MarketCard';
import { MarketStatus } from '../types/market';

type FilterStatus = 'all' | 'active' | 'resolved';

export function MarketsPage() {
  const { markets, isLoading, error, refetch } = useMarkets();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = markets.filter((market) => {
    if (filter === 'active' && market.status !== MarketStatus.ACTIVE) return false;
    if (filter === 'resolved' && market.status !== MarketStatus.RESOLVED) return false;
    if (searchQuery && !market.question.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => b.createdAt - a.createdAt);

  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            Markets
          </h1>
          <p style={{ fontSize: 18, color: '#737373' }}>
            Browse and trade on prediction markets
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 20, 
          marginBottom: 48
        }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
            <svg
              style={{ 
                position: 'absolute', 
                left: 16, 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: 20,
                height: 20,
                color: '#525252'
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 52px',
                background: '#111',
                border: '1px solid #262626',
                borderRadius: 12,
                color: '#fff',
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>

          {/* Filter Tabs & Refresh */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              gap: 8,
              padding: 6,
              borderRadius: 14,
              background: '#111',
              border: '1px solid #262626'
            }}>
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: filter === f.value ? '#3b82f6' : 'transparent',
                    color: filter === f.value ? '#fff' : '#737373',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={refetch}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 10,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <svg
                style={{ width: 18, height: 18 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: 20,
            marginBottom: 32,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171'
          }}>
            <p>{error}</p>
            <button 
              onClick={refetch}
              style={{
                marginTop: 12,
                background: 'none',
                border: 'none',
                color: '#f87171',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading && markets.length === 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                padding: 32,
                background: '#111',
                borderRadius: 20,
                border: '1px solid #262626',
                height: 280
              }}>
                <div style={{ height: 24, width: 80, background: '#222', borderRadius: 6, marginBottom: 20 }} />
                <div style={{ height: 20, width: '100%', background: '#222', borderRadius: 6, marginBottom: 12 }} />
                <div style={{ height: 20, width: '75%', background: '#222', borderRadius: 6, marginBottom: 32 }} />
                <div style={{ height: 8, width: '100%', background: '#222', borderRadius: 4, marginBottom: 32 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ height: 40, width: 80, background: '#222', borderRadius: 6 }} />
                  <div style={{ height: 40, width: 80, background: '#222', borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : sortedMarkets.length > 0 ? (
          <>
            <p style={{ fontSize: 14, color: '#525252', marginBottom: 24 }}>
              Showing {sortedMarkets.length} market{sortedMarkets.length !== 1 ? 's' : ''}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32
            }}>
              {sortedMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </>
        ) : (
          <div style={{
            padding: '80px 40px',
            background: '#111',
            borderRadius: 20,
            border: '1px solid #262626',
            textAlign: 'center'
          }}>
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
            </div>              
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
              No markets found
            </h3>
            <p style={{ fontSize: 16, color: '#737373', marginBottom: 32 }}>
              {searchQuery ? 'Try adjusting your search' : 'No markets match your filter'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '14px 28px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View All Markets
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
