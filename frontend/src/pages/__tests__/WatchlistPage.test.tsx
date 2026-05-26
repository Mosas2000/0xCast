import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { WatchlistPage } from '../WatchlistPage';
import { WatchlistProvider } from '../../contexts/WatchlistContext';
import { MarketStatus, MarketOutcome } from '../../types/market';
import { saveWatchlistIds } from '../../utils/watchlist';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/hooks/useMarkets', () => ({
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

describe('WatchlistPage', () => {
  beforeEach(() => {
    saveWatchlistIds([]);
  });

  it('renders saved markets from the watchlist', async () => {
    saveWatchlistIds([9, 4]);

    render(
      <MemoryRouter>
        <WatchlistProvider>
          <WatchlistPage />
        </WatchlistProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Will market nine resolve no?')).toBeTruthy();
      expect(screen.getByText('Will market four resolve yes?')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Clear watchlist' })).toBeTruthy();
    });
  });
});
