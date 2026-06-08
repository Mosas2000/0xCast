import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMarketFiltering } from './useMarketFiltering';
import { MarketCategory, SortOption } from '../utils/marketCategories';
import type { Market } from '../types/market';
import { MarketStatus, MarketOutcome } from '../types/market';

const markets: Market[] = [
  {
    id: 1,
    question: 'Will Bitcoin hit $100k?',
    creator: 'SP1',
    endDate: 1000,
    resolutionDate: 1100,
    totalYesStake: 500,
    totalNoStake: 300,
    status: MarketStatus.ACTIVE,
    outcome: MarketOutcome.NONE,
    createdAt: 3,
  },
  {
    id: 2,
    question: 'Will the Super Bowl draw record viewers?',
    creator: 'SP2',
    endDate: 1000,
    resolutionDate: 1100,
    totalYesStake: 100,
    totalNoStake: 200,
    status: MarketStatus.RESOLVED,
    outcome: MarketOutcome.YES,
    createdAt: 1,
  },
  {
    id: 3,
    question: 'Will a new movie win best picture?',
    creator: 'SP3',
    endDate: 1000,
    resolutionDate: 1100,
    totalYesStake: 900,
    totalNoStake: 100,
    status: MarketStatus.ACTIVE,
    outcome: MarketOutcome.NONE,
    createdAt: 2,
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, {}, children);

describe('useMarketFiltering', () => {
  it('filters and sorts markets', () => {
    const { result } = renderHook(
      () => useMarketFiltering({ markets }),
      { wrapper }
    );

    expect(result.current.counts.all).toBe(3);
    expect(result.current.filteredMarkets[0].id).toBe(1);

    act(() => {
      result.current.setStatusFilter('active');
      result.current.setCategory(MarketCategory.CRYPTO);
      result.current.setSortOption(SortOption.OLDEST);
      result.current.setSearchQuery('bitcoin');
    });

    expect(result.current.filteredMarkets).toHaveLength(1);
    expect(result.current.filteredMarkets[0].id).toBe(1);
  });
});
