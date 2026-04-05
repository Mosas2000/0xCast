/**
 * useMarketFiltering Hook
 * 
 * Provides filtering, sorting, and categorization logic for markets.
 */
import { useMemo, useState, useCallback } from 'react';
import type { Market } from '../types/market';
import { MarketStatus } from '../types/market';
import {
  MarketCategory,
  SortOption,
  categorizeMarket,
} from '../utils/marketCategories';

interface UseMarketFilteringOptions {
  markets: Market[];
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

export function useMarketFiltering({ markets }: UseMarketFilteringOptions): UseMarketFilteringReturn {
  const [category, setCategory] = useState<MarketCategory>(MarketCategory.ALL);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NEWEST);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    setCategory(MarketCategory.ALL);
    setSortOption(SortOption.NEWEST);
    setStatusFilter('all');
    setSearchQuery('');
  }, []);

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
