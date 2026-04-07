import { Link } from 'react-router-dom';
import { useMarkets } from '../hooks/useMarkets';
import { useMarketFiltering } from '../hooks/useMarketFiltering';
import { MarketCard } from '../components/MarketCard';
import { MarketFilter } from '../components/MarketFilter';
import { getCategoryConfig, CATEGORIES, MarketCategory } from '../utils/marketCategories';

export function MarketsPage() {
  const { markets, isLoading, error, refetch } = useMarkets();
  const {
    filteredMarkets,
    category,
    sortOption,
    statusFilter,
    searchQuery,
    setCategory,
    setSortOption,
    setStatusFilter,
    setSearchQuery,
    counts,
    resetFilters,
  } = useMarketFiltering({ markets, syncWithUrl: true });

  const activeCategory = getCategoryConfig(category);

  return (
    <div className="pt-[72px] min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Markets
            </h1>
            <Link 
              to="/create-market"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm sm:text-base font-semibold transition-colors"
            >
              <span>+</span> Create Market
            </Link>
          </div>
          <p className="text-base sm:text-lg text-neutral-500">
            Browse and trade on prediction markets
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:gap-5 mb-8 sm:mb-12">
          {/* Search */}
          <div className="relative max-w-full sm:max-w-lg">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
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
              className="w-full py-3 sm:py-4 pl-12 pr-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm sm:text-base placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
            <MarketFilter
              selectedCategory={category}
              selectedSort={sortOption}
              selectedStatus={statusFilter}
              onCategoryChange={setCategory}
              onSortChange={setSortOption}
              onStatusChange={setStatusFilter}
              marketCounts={{
                all: counts.all,
                active: counts.active,
                resolved: counts.resolved,
              }}
            />

            <button
              onClick={refetch}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Quick Filter Chips */}
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
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
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                  isSelected 
                    ? 'border-current' 
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
                style={{ 
                  color: isSelected ? cat.color : undefined,
                  backgroundColor: isSelected ? `${cat.color}15` : 'transparent',
                  borderColor: isSelected ? cat.color : undefined
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ 
                    backgroundColor: isSelected ? `${cat.color}25` : '#333' 
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active filters indicator */}
        {(category !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm text-neutral-500">Active filters:</span>
            {category !== 'all' && (
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: `${activeCategory.color}15`,
                  color: activeCategory.color,
                  border: `1px solid ${activeCategory.color}30`
                }}
              >
                {activeCategory.icon} {activeCategory.label}
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-sm text-blue-500">
                Search: "{searchQuery}"
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-sm text-neutral-400 hover:text-white underline transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 sm:p-5 mb-6 sm:mb-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <p className="text-sm sm:text-base">{error}</p>
            <button 
              onClick={refetch}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading && markets.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="p-5 sm:p-6 lg:p-8 bg-neutral-900 rounded-2xl border border-neutral-800 h-60 sm:h-72 animate-pulse"
              >
                <div className="h-5 w-20 bg-neutral-800 rounded mb-5" />
                <div className="h-4 w-full bg-neutral-800 rounded mb-3" />
                <div className="h-4 w-3/4 bg-neutral-800 rounded mb-8" />
                <div className="h-2 w-full bg-neutral-800 rounded mb-8" />
                <div className="flex justify-between">
                  <div className="h-10 w-20 bg-neutral-800 rounded" />
                  <div className="h-10 w-20 bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          <>
            <p className="text-sm text-neutral-500 mb-4 sm:mb-6">
              Showing {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 bg-neutral-900 rounded-2xl border border-neutral-800 text-center">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl sm:text-3xl"
              style={{ 
                backgroundColor: category !== 'all' ? `${activeCategory.color}15` : '#1a1a1a'
              }}
            >
            </div>                            {category !== 'all' ? activeCategory.icon : '
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
              {category !== 'all' 
                ? `No ${activeCategory.label} Markets`
                : searchQuery
                  ? 'No Markets Found'
                  : 'No Markets Yet'}
            </h3>
            <p className="text-sm sm:text-base text-neutral-400 mb-6 max-w-md mx-auto">
              {category !== 'all'
                ? `There are no markets in the ${activeCategory.label} category yet. Why not create one?`
                : searchQuery 
                  ? `No markets match "${searchQuery}". Try adjusting your search.`
                  : 'Be the first to create a prediction market!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(category !== 'all' || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/create-market"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
              >
                Create Market
              </Link>
            </div>
          </div>
        )}

        {/* Load more indicator (if applicable) */}
        {isLoading && markets.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-neutral-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading more markets...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
