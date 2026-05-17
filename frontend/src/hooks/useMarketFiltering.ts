/**
 * useMarketFiltering Hook
 * 
 * Provides filtering, sorting, and categorization logic for markets.
 * Supports URL query params for filter persistence.
 */
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Market } from '../types/market';
import { MarketStatus } from '../types/market';
import {
  TimeRange,
  VolumeRange,
  VOLUME_THRESHOLDS,
} from '../types/filters';
import { GDPRComplianceService } from '../services/GDPRComplianceService';
import {
  MarketCategory,
  SortOption,
  categorizeMarket,
  getCategoryConfig,
} from '../utils/marketCategories';
import { loadWatchlistIds } from '../utils/watchlist';

interface UseMarketFilteringOptions {
  markets: Market[];
  syncWithUrl?: boolean;
}

interface UseMarketFilteringReturn {
  // State
  filteredMarkets: Market[];
  category: MarketCategory;
  sortOption: SortOption;
  statusFilter: 'all' | 'active' | 'resolved';
  searchQuery: string;
  timeRange: TimeRange;
  volumeRange: VolumeRange;
  onlyWatchlist: boolean;
  isSearching: boolean;
  recentSearches: string[];
  
  // Setters
  setCategory: (category: MarketCategory) => void;
  setSortOption: (sort: SortOption) => void;
  setStatusFilter: (status: 'all' | 'active' | 'resolved') => void;
  setSearchQuery: (query: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setVolumeRange: (range: VolumeRange) => void;
  setOnlyWatchlist: (only: boolean) => void;
  clearRecentSearches: () => void;
  
  // Counts
  counts: {
    all: number;
    active: number;
    resolved: number;
    byCategory: Record<MarketCategory, number>;
  };
  
  // Reset
  resetFilters: () => void;
}

/**
 * Parse category from URL parameter
 * @param value - URL parameter value for category
 * @returns Valid MarketCategory or ALL if invalid
 */
function parseCategoryParam(value: string | null): MarketCategory {
  if (!value) return MarketCategory.ALL;
  const categories = Object.values(MarketCategory);
  return categories.includes(value as MarketCategory) 
    ? (value as MarketCategory) 
    : MarketCategory.ALL;
}

/**
 * Parse sort option from URL parameter
 * @param value - URL parameter value for sort option
 * @returns Valid SortOption or NEWEST if invalid
 */
function parseSortParam(value: string | null): SortOption {
  if (!value) return SortOption.NEWEST;
  const options = Object.values(SortOption);
  return options.includes(value as SortOption) 
    ? (value as SortOption) 
    : SortOption.NEWEST;
}

/**
 * Parse status filter from URL parameter
 * @param value - URL parameter value for status filter
 * @returns 'active', 'resolved', or 'all' if invalid
 */
function parseStatusParam(value: string | null): 'all' | 'active' | 'resolved' {
  if (value === 'active' || value === 'resolved') return value;
  return 'all';
}

/**
 * Parse time range filter from URL parameter
 * @param value - URL parameter value for time range
 * @returns Valid TimeRange or 'all' if invalid
 */
function parseTimeRangeParam(value: string | null): TimeRange {
  const ranges: TimeRange[] = ['all', '24h', '7d', '30d', 'custom'];
  return ranges.includes(value as TimeRange) ? (value as TimeRange) : 'all';
}

/**
 * Parse volume range filter from URL parameter
 * @param value - URL parameter value for volume range
 * @returns Valid VolumeRange or 'all' if invalid
 */
function parseVolumeRangeParam(value: string | null): VolumeRange {
  const ranges: VolumeRange[] = ['all', 'low', 'medium', 'high'];
  return ranges.includes(value as VolumeRange) ? (value as VolumeRange) : 'all';
}

/**
 * Custom hook for filtering, sorting, and categorizing prediction markets
 * 
 * Provides comprehensive market filtering capabilities including:
 * - Category-based filtering (Crypto, DeFi, Sports, etc.)
 * - Status filtering (Active, Resolved, All)
 * - Text search with debouncing (500ms delay)
 * - Time range filtering (24h, 7d, 30d)
 * - Volume range filtering (Low, Medium, High)
 * - Watchlist filtering
 * - Multiple sort options (Newest, Volume, Ending Soon, etc.)
 * - URL parameter synchronization for shareable filter states
 * - Recent search history persistence (localStorage)
 * 
 * @param options - Configuration options
 * @param options.markets - Array of markets to filter
 * @param options.syncWithUrl - Whether to sync filter state with URL parameters (default: false)
 * 
 * @returns Object containing filtered markets, filter state, and setter functions
 * 
 * @example
 * ```tsx
 * const {
 *   filteredMarkets,
 *   setCategory,
 *   setSearchQuery,
 *   resetFilters
 * } = useMarketFiltering({
 *   markets: allMarkets,
 *   syncWithUrl: true
 * });
 * ```
 */
export function useMarketFiltering({ markets, syncWithUrl = false }: UseMarketFilteringOptions): UseMarketFilteringReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse URL parameters and initialize filter values
  // These values are used to initialize React state hooks below
  const initialCategory = syncWithUrl ? parseCategoryParam(searchParams.get('category')) : MarketCategory.ALL;
  const initialSort = syncWithUrl ? parseSortParam(searchParams.get('sort')) : SortOption.NEWEST;
  const initialStatus = syncWithUrl ? parseStatusParam(searchParams.get('status')) : 'all';
  const initialSearch = syncWithUrl ? (searchParams.get('q') || '') : '';
  const initialTimeRange = syncWithUrl ? parseTimeRangeParam(searchParams.get('time')) : 'all';
  const initialVolumeRange = syncWithUrl ? parseVolumeRangeParam(searchParams.get('volume')) : 'all';
  const initialOnlyWatchlist = syncWithUrl ? searchParams.get('watchlist') === 'true' : false;
  
  // Initialize React state hooks with parsed URL values
  const [category, setCategoryState] = useState<MarketCategory>(initialCategory);
  const [sortOption, setSortOptionState] = useState<SortOption>(initialSort);
  const [statusFilter, setStatusFilterState] = useState<'all' | 'active' | 'resolved'>(initialStatus);
  const [searchQuery, setSearchQueryState] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const [timeRange, setTimeRangeState] = useState<TimeRange>(initialTimeRange);
  const [volumeRange, setVolumeRangeState] = useState<VolumeRange>(initialVolumeRange);
  const [onlyWatchlist, setOnlyWatchlistState] = useState(initialOnlyWatchlist);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('0xcast_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state changes to URL
  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    if (!syncWithUrl) return;
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || value === MarketCategory.ALL || value === SortOption.NEWEST) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      return newParams;
    }, { replace: true });
  }, [syncWithUrl, setSearchParams]);

  // Wrapped setters that also update URL
  const setCategory = useCallback((value: MarketCategory) => {
    setCategoryState(value);
    updateUrlParams({ category: value });
  }, [updateUrlParams]);

  const setSortOption = useCallback((value: SortOption) => {
    setSortOptionState(value);
    updateUrlParams({ sort: value });
  }, [updateUrlParams]);

  const setStatusFilter = useCallback((value: 'all' | 'active' | 'resolved') => {
    setStatusFilterState(value);
    updateUrlParams({ status: value });
  }, [updateUrlParams]);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
    setIsSearching(true);
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      updateUrlParams({ q: searchQuery });
      setIsSearching(false);
      
      // Add to recent searches if not empty and not already present
      if (searchQuery.trim() && searchQuery.length > 2) {
        setRecentSearches(prev => {
          const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
          if (GDPRComplianceService.isPersonalizationEnabled()) {
            localStorage.setItem('0xcast_recent_searches', JSON.stringify(updated));
          }
          return updated;
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, updateUrlParams]);

  const setTimeRange = useCallback((value: TimeRange) => {
    setTimeRangeState(value);
    updateUrlParams({ time: value });
  }, [updateUrlParams]);

  const setVolumeRange = useCallback((value: VolumeRange) => {
    setVolumeRangeState(value);
    updateUrlParams({ volume: value });
  }, [updateUrlParams]);

  const setOnlyWatchlist = useCallback((value: boolean) => {
    setOnlyWatchlistState(value);
    updateUrlParams({ watchlist: value ? 'true' : null });
  }, [updateUrlParams]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('0xcast_recent_searches');
  }, []);

  // Categorize all markets
  const categorizedMarkets = useMemo(() => {
    return markets.map(market => ({
      ...market,
      category: categorizeMarket(market.question),
    }));
  }, [markets]);

  // Calculate counts
  const counts = useMemo(() => {
    const active = categorizedMarkets.filter(m => m.status === MarketStatus.ACTIVE).length;
    const resolved = categorizedMarkets.filter(m => m.status === MarketStatus.RESOLVED).length;
    
    const byCategory: Record<MarketCategory, number> = {
      [MarketCategory.ALL]: categorizedMarkets.length,
      [MarketCategory.CRYPTO]: 0,
      [MarketCategory.DEFI]: 0,
      [MarketCategory.SPORTS]: 0,
      [MarketCategory.POLITICS]: 0,
      [MarketCategory.ENTERTAINMENT]: 0,
      [MarketCategory.SCIENCE]: 0,
      [MarketCategory.BUSINESS]: 0,
      [MarketCategory.OTHER]: 0,
    };
    
    categorizedMarkets.forEach(m => {
      byCategory[m.category]++;
    });
    
    return {
      all: categorizedMarkets.length,
      active,
      resolved,
      byCategory,
    };
  }, [categorizedMarkets]);

  // Filter markets
  const filteredMarkets = useMemo(() => {
    let result = [...categorizedMarkets];
    const watchlistIds = loadWatchlistIds();
    
    // Filter by watchlist
    if (onlyWatchlist) {
      result = result.filter(m => watchlistIds.includes(m.id));
    }
    
    // Filter by status
    if (statusFilter === 'active') {
      result = result.filter(m => m.status === MarketStatus.ACTIVE);
    } else if (statusFilter === 'resolved') {
      result = result.filter(m => m.status === MarketStatus.RESOLVED);
    }
    
    // Filter by category
    if (category !== MarketCategory.ALL) {
      result = result.filter(m => m.category === category);
    }
    
    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const queryTerms = debouncedSearchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
      result = result.filter(m => {
        const question = m.question.toLowerCase();
        const creator = m.creator?.toLowerCase() || '';
        const categoryLabel = getCategoryConfig(m.category).label.toLowerCase();
        
        // Match if all terms are found in either question, creator, or category
        return queryTerms.every(term => 
          question.includes(term) || 
          creator.includes(term) || 
          categoryLabel.includes(term)
        );
      });
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      let threshold = 0;
      
      if (timeRange === '24h') threshold = now - dayMs;
      else if (timeRange === '7d') threshold = now - 7 * dayMs;
      else if (timeRange === '30d') threshold = now - 30 * dayMs;
      
      if (threshold > 0) {
        result = result.filter(m => m.createdAt >= threshold);
      }
    }

    // Filter by volume range
    if (volumeRange !== 'all') {
      result = result.filter(m => {
        const volume = m.totalYesStake + m.totalNoStake;
        if (volumeRange === 'low') return volume < VOLUME_THRESHOLDS.low;
        if (volumeRange === 'medium') return volume >= VOLUME_THRESHOLDS.low && volume < VOLUME_THRESHOLDS.high;
        if (volumeRange === 'high') return volume >= VOLUME_THRESHOLDS.high;
        return true;
      });
    }
    
    // Sort
    switch (sortOption) {
      case SortOption.NEWEST:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case SortOption.OLDEST:
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case SortOption.VOLUME_HIGH:
        result.sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake));
        break;
      case SortOption.VOLUME_LOW:
        result.sort((a, b) => (a.totalYesStake + a.totalNoStake) - (b.totalYesStake + b.totalNoStake));
        break;
      case SortOption.ENDING_SOON:
        result.sort((a, b) => a.endDate - b.endDate);
        break;
      case SortOption.MOST_PARTICIPANTS:
        // Approximate by total volume since we don't have participant count
        result.sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake));
        break;
    }
    
    return result;
  }, [categorizedMarkets, category, sortOption, statusFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setCategoryState(MarketCategory.ALL);
    setSortOptionState(SortOption.NEWEST);
    setStatusFilterState('all');
    setSearchQueryState('');
    setTimeRangeState('all');
    setVolumeRangeState('all');
    setOnlyWatchlistState(false);
    if (syncWithUrl) {
      setSearchParams({}, { replace: true });
    }
  }, [syncWithUrl, setSearchParams]);

  useEffect(() => {
    const filters = {
      category,
      sortOption,
      statusFilter,
      timeRange,
      volumeRange,
    };
    if (GDPRComplianceService.isPersonalizationEnabled()) {
      localStorage.setItem('0xcast_last_filters', JSON.stringify(filters));
    }
  }, [category, sortOption, statusFilter, timeRange, volumeRange]);

  return {
    filteredMarkets,
    category,
    sortOption,
    statusFilter,
    searchQuery,
    timeRange,
    volumeRange,
    onlyWatchlist,
    isSearching,
    recentSearches,
    setCategory,
    setSortOption,
    setStatusFilter,
    setSearchQuery,
    setTimeRange,
    setVolumeRange,
    setOnlyWatchlist,
    clearRecentSearches,
    counts,
    resetFilters,
  };
}
