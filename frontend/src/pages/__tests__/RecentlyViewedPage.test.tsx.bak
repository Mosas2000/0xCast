import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { RecentlyViewedPage } from '../RecentlyViewedPage';
import { RecentlyViewedProvider } from '../../contexts/RecentlyViewedContext';
import { WatchlistProvider } from '../../contexts/WatchlistContext';
import { MarketStatus, MarketOutcome } from '../../types/market';
import { saveRecentlyViewedEntries } from '../../utils/recentlyViewed';

vi.mock('../../hooks/useMarkets', () => ({
  useMarkets: () => ({
    markets: [
      {
        id: 4,
        question: 'Will market four resolve yes?',
        creator: 'SPTEST4',
        endDate: 100,
        resolutionDate: 200,
        totalYesStake: 20,
        totalNoStake: 10,
        status: MarketStatus.ACTIVE,
        outcome: MarketOutcome.NONE,
        createdAt: 1,
      },
      {
        id: 9,
        question: 'Will market nine resolve no?',
        creator: 'SPTEST9',
        endDate: 100,
        resolutionDate: 200,
        totalYesStake: 15,
        totalNoStake: 25,
        status: MarketStatus.ACTIVE,
        outcome: MarketOutcome.NONE,
        createdAt: 2,
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('RecentlyViewedPage', () => {
  beforeEach(() => {
    saveRecentlyViewedEntries([]);
  });

  it('renders recently viewed markets from the history', async () => {
    saveRecentlyViewedEntries([
      { marketId: 9, viewedAt: 200 },
      { marketId: 4, viewedAt: 100 },
    ]);

    render(
      <MemoryRouter>
        <WatchlistProvider>
          <RecentlyViewedProvider>
            <RecentlyViewedPage />
          </RecentlyViewedProvider>
        </WatchlistProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Will market nine resolve no?')).toBeTruthy();
      expect(screen.getByText('Will market four resolve yes?')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Clear history' })).toBeTruthy();
    });
  });
});
