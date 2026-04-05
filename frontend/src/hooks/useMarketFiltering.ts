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
  MarketCategory,
  SortOption,
  categorizeMarket,
} from '../utils/marketCategories';

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
  
  // Setters
  setCategory: (category: MarketCategory) => void;
  setSortOption: (sort: SortOption) => void;
  setStatusFilter: (status: 'all' | 'active' | 'resolved') => void;
  setSearchQuery: (query: string) => void;
  
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

// Parse category from URL param
function parseCategoryParam(value: string | null): MarketCategory {
  if (!value) return MarketCategory.ALL;
  const categories = Object.values(MarketCategory);
  return categories.includes(value as MarketCategory) 
    ? (value as MarketCategory) 
    : MarketCategory.ALL;
}

// Parse sort option from URL param
function parseSortParam(value: string | null): SortOption {
  if (!value) return SortOption.NEWEST;
  const options = Object.values(SortOption);
  return options.includes(value as SortOption) 
    ? (value as SortOption) 
    : SortOption.NEWEST;
}

// Parse status filter from URL param
function parseStatusParam(value: string | null): 'all' | 'active' | 'resolved' {
  if (value === 'active' || value === 'resolved') return value;
  return 'all';
}

export function useMarketFiltering({ markets, syncWithUrl = false }: UseMarketFilteringOptions): UseMarketFilteringReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params if syncing
  const initialCategory = syncWithUrl ? parseCategoryParam(searchParams.get('category')) : MarketCategory.ALL;
  const initialSort = syncWithUrl ? parseSortParam(searchParams.get('sort')) : SortOption.NEWEST;
  const initialStatus = syncWithUrl ? parseStatusParam(searchParams.get('status')) : 'all';
  const initialSearch = syncWithUrl ? (searchParams.get('q') || '') : '';
  
  const [category, setCategoryState] = useState<MarketCategory>(initialCategory);
  const [sortOption, setSortOptionState] = useState<SortOption>(initialSort);
  const [statusFilter, setStatusFilterState] = useState<'all' | 'active' | 'resolved'>(initialStatus);
  const [searchQuery, setSearchQueryState] = useState(initialSearch);

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
    updateUrlParams({ q: value });
  }, [updateUrlParams]);

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
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.question.toLowerCase().includes(query) ||
        m.creator?.toLowerCase().includes(query)
      );
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
        result.sort((a, b) => (b.yesPool + b.noPool) - (a.yesPool + a.noPool));
        break;
      case SortOption.VOLUME_LOW:
        result.sort((a, b) => (a.yesPool + a.noPool) - (b.yesPool + b.noPool));
        break;
      case SortOption.ENDING_SOON:
        result.sort((a, b) => a.endBlock - b.endBlock);
        break;
      case SortOption.MOST_PARTICIPANTS:
        // Approximate by total volume since we don't have participant count
        result.sort((a, b) => (b.yesPool + b.noPool) - (a.yesPool + a.noPool));
        break;
    }
    
    return result;
  }, [categorizedMarkets, category, sortOption, statusFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setCategoryState(MarketCategory.ALL);
    setSortOptionState(SortOption.NEWEST);
    setStatusFilterState('all');
    setSearchQueryState('');
    if (syncWithUrl) {
      setSearchParams({}, { replace: true });
    }
  }, [syncWithUrl, setSearchParams]);

  return {
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
  };
}
