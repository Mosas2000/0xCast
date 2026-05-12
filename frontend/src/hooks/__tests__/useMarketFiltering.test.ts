import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useMarketFiltering } from '../useMarketFiltering';
import { MarketStatus } from '../../types/market';
import type { Market } from '../../types/market';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockMarkets: Market[] = [
  {
    id: 1,
    question: 'Will Bitcoin reach $100k by end of 2026?',
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    status: MarketStatus.ACTIVE,
    totalYesStake: 1000000,
    totalNoStake: 500000,
    createdAt: Date.now() - 86400000, // 1 day ago
    endDate: Date.now() + 86400000 * 30, // 30 days from now
    resolvedAt: 0,
    winningOutcome: null,
  },
  {
    id: 2,
    question: 'Will Ethereum merge to PoS succeed?',
    creator: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    status: MarketStatus.RESOLVED,
    totalYesStake: 2000000,
    totalNoStake: 1000000,
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    endDate: Date.now() - 86400000, // 1 day ago
    resolvedAt: Date.now() - 86400000,
    winningOutcome: 'yes',
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useMarketFiltering', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      expect(result.current.filteredMarkets).toHaveLength(2);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.isSearching).toBe(false);
    });

    it('should initialize with all markets unfiltered', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      expect(result.current.filteredMarkets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ])
      );
    });

    it('should load recent searches from localStorage', () => {
      localStorageMock.setItem(
        '0xcast_recent_searches',
        JSON.stringify(['bitcoin', 'ethereum'])
      );

      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      expect(result.current.recentSearches).toEqual(['bitcoin', 'ethereum']);
    });
  });

  describe('filtering', () => {
    it('should filter markets by status', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      act(() => {
        result.current.setStatusFilter('active');
      });

      expect(result.current.filteredMarkets).toHaveLength(1);
      expect(result.current.filteredMarkets[0].status).toBe(MarketStatus.ACTIVE);
    });

    it('should filter markets by resolved status', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      act(() => {
        result.current.setStatusFilter('resolved');
      });

      expect(result.current.filteredMarkets).toHaveLength(1);
      expect(result.current.filteredMarkets[0].status).toBe(MarketStatus.RESOLVED);
    });
  });

  describe('search functionality', () => {
    it('should update search query', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      act(() => {
        result.current.setSearchQuery('bitcoin');
      });

      expect(result.current.searchQuery).toBe('bitcoin');
      expect(result.current.isSearching).toBe(true);
    });

    it('should clear recent searches', () => {
      localStorageMock.setItem(
        '0xcast_recent_searches',
        JSON.stringify(['bitcoin', 'ethereum'])
      );

      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      act(() => {
        result.current.clearRecentSearches();
      });

      expect(result.current.recentSearches).toEqual([]);
      expect(localStorageMock.getItem('0xcast_recent_searches')).toBeNull();
    });
  });

  describe('counts', () => {
    it('should calculate correct market counts', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      expect(result.current.counts.all).toBe(2);
      expect(result.current.counts.active).toBe(1);
      expect(result.current.counts.resolved).toBe(1);
    });
  });

  describe('reset functionality', () => {
    it('should reset all filters to defaults', () => {
      const { result } = renderHook(
        () => useMarketFiltering({ markets: mockMarkets }),
        { wrapper }
      );

      act(() => {
        result.current.setSearchQuery('bitcoin');
        result.current.setStatusFilter('active');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.statusFilter).toBe('all');
    });
  });
});
