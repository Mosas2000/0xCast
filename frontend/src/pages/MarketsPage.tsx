import { useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { useMarkets } from '../hooks/useMarkets';
import { useMarketFiltering } from '../hooks/useMarketFiltering';
import { useFilterPresets } from '../hooks/useFilterPresets';
import { useRealtimeSignal } from '../hooks/useRealtimeSignal';
import { MarketCard } from '../components/MarketCard';
import { MarketFilter } from '../components/MarketFilter';
import { getCategoryConfig, CATEGORIES, MarketCategory } from '../utils/marketCategories';

export function MarketsPage() {
  const { markets, isLoading, error, refetch } = useMarkets();
  const { signal, source, isSocketConnected } = useRealtimeSignal({ enabled: true });
  const {
    filteredMarkets,
    category,
    sortOption,
    statusFilter,
    searchQuery,
    timeRange,
    volumeRange,
    setCategory,
    setSortOption,
    setStatusFilter,
    setSearchQuery,
    setTimeRange,
    setVolumeRange,
    counts,
    resetFilters,
  } = useMarketFiltering({ markets, syncWithUrl: true });

  const { presets, activePresetId, setActivePresetId, savePreset, deletePreset } = useFilterPresets();

  const activeCategory = getCategoryConfig(category);
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
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>
              Markets
            </h1>
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>+</span> Create Market
            </Link>
            <Link
              to="/multi-markets"
              style={{
                marginLeft: 12,
                padding: '12px 24px',
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              Multi Markets
            </Link>
          </div>
          <p style={{ fontSize: 18, color: '#737373' }}>
            Browse and trade on prediction markets
          </p>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>
            Live updates: {isSocketConnected ? 'Connected' : 'Polling'} via {source} • Last update {lastUpdatedAt.toLocaleTimeString()}
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

          {/* Presets */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => {
                  if (preset.filters.category) setCategory(preset.filters.category);
                  if (preset.filters.sortOption) setSortOption(preset.filters.sortOption);
                  if (preset.filters.status) setStatusFilter(preset.filters.status);
                  if (preset.filters.timeRange) setTimeRange(preset.filters.timeRange);
                  if (preset.filters.volumeRange) setVolumeRange(preset.filters.volumeRange);
                  setActivePresetId(preset.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: activePresetId === preset.id ? '#3B82F620' : '#111',
                  border: `1px solid ${activePresetId === preset.id ? '#3B82F6' : '#262626'}`,
                  borderRadius: 20,
                  color: activePresetId === preset.id ? '#3B82F6' : '#9CA3AF',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{preset.icon || '🔖'}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <MarketFilter
              selectedCategory={category}
              selectedSort={sortOption}
              selectedStatus={statusFilter}
              selectedTimeRange={timeRange}
              selectedVolumeRange={volumeRange}
              onCategoryChange={setCategory}
              onSortChange={setSortOption}
              onStatusChange={setStatusFilter}
              onTimeRangeChange={setTimeRange}
              onVolumeRangeChange={setVolumeRange}
              marketCounts={{
                all: counts.all,
                active: counts.active,
                resolved: counts.resolved,
              }}
            />

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

        {/* Category Quick Filter Chips */}
        <div style={{ 
          display: 'flex', 
          gap: 10, 
          marginBottom: 24, 
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {CATEGORIES.filter(cat => 
            cat.value === MarketCategory.ALL || counts.byCategory[cat.value] > 0
          ).map((cat) => {
            const isSelected = category === cat.value;
            const count = cat.value === MarketCategory.ALL 
              ? counts.all 
              : counts.byCategory[cat.value];
            
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: isSelected ? `${cat.color}20` : 'transparent',
                  border: `1px solid ${isSelected ? cat.color : '#333'}`,
                  borderRadius: 20,
                  color: isSelected ? cat.color : '#9ca3af',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span style={{
                  background: isSelected ? `${cat.color}30` : '#333',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active filters indicator */}
        {(category !== 'all' || searchQuery) && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 24,
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: 14, color: '#6B7280' }}>Active filters:</span>
            {category !== 'all' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: `${activeCategory.color}20`,
                border: `1px solid ${activeCategory.color}40`,
                borderRadius: 20,
                fontSize: 13,
                color: activeCategory.color,
              }}>
                {activeCategory.icon} {activeCategory.label}
              </span>
            )}
            {searchQuery && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: '#3B82F620',
                border: '1px solid #3B82F640',
                borderRadius: 20,
                fontSize: 13,
                color: '#3B82F6',
              }}>
                Search: "{searchQuery}"
              </span>
            )}
            {timeRange !== 'all' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: '#10B98120',
                border: '1px solid #10B98140',
                borderRadius: 20,
                fontSize: 13,
                color: '#10B981',
              }}>
                Time: {timeRange}
              </span>
            )}
            {volumeRange !== 'all' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: '#F59E0B20',
                border: '1px solid #F59E0B40',
                borderRadius: 20,
                fontSize: 13,
                color: '#F59E0B',
              }}>
                Volume: {volumeRange}
              </span>
            )}
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear all
            </button>
          </div>
        )}

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
        ) : filteredMarkets.length > 0 ? (
          <>
            <p style={{ fontSize: 14, color: '#525252', marginBottom: 24 }}>
              Showing {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32
            }}>
              {filteredMarkets.map((market) => (
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
              background: category !== 'all' ? `${activeCategory.color}15` : '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              {category !== 'all' ? activeCategory.icon : '🔍'}
            </div>              
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
              {category !== 'all' 
                ? `No ${activeCategory.label} Markets`
                : 'No markets found'}
            </h3>
            <p style={{ fontSize: 16, color: '#737373', marginBottom: 32 }}>
              {searchQuery 
                ? `No markets matching "${searchQuery}" in ${category !== 'all' ? activeCategory.label : 'any category'}`
                : category !== 'all'
                  ? `There are no ${activeCategory.label.toLowerCase()} markets at the moment`
                  : 'No markets match your current filters'}
            </p>
            {searchQuery || category !== 'all' ? (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {category !== 'all' && (
                  <button
                    onClick={() => setCategory(MarketCategory.ALL)}
                    style={{
                      padding: '14px 28px',
                      background: `${activeCategory.color}20`,
                      border: `1px solid ${activeCategory.color}40`,
                      borderRadius: 10,
                      color: activeCategory.color,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View All Categories
                  </button>
                )}
                <button
                  onClick={resetFilters}
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
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to="/create-market"
                  style={{
                    padding: '14px 28px',
                    background: '#3B82F6',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>+</span> Create First Market
                </Link>
                <button
                  onClick={refetch}
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
                  Refresh Markets
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
