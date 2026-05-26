import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MarketCard } from '../MarketCard';
import { WatchlistProvider } from '../../contexts/WatchlistContext';
import { MarketStatus, MarketOutcome } from '../../types/market';
import { loadWatchlistIds, saveWatchlistIds } from '../../utils/watchlist';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const market = {
  id: 7,
  question: 'Will this market remain listed?',
  creator: 'SPTEST',
  endDate: 1000,
  resolutionDate: 2000,
  totalYesStake: 100,
  totalNoStake: 50,
  status: MarketStatus.ACTIVE,
  outcome: MarketOutcome.NONE,
  createdAt: 1,
} as const;

function renderCard() {
  return render(
    <MemoryRouter>
      <WatchlistProvider>
        <MarketCard market={market} />
      </WatchlistProvider>
    </MemoryRouter>
  );
}

describe('MarketCard watchlist control', () => {
  beforeEach(() => {
    saveWatchlistIds([]);
  });

  it('toggles watchlist state without breaking the card link', async () => {
    renderCard();

    expect(screen.getByRole('link', { name: /open market/i })).toHaveAttribute('href', '/trade/7');

    const button = screen.getByRole('button', { name: 'markets:actions.addToWatchlist' });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'markets:actions.removeFromWatchlist' })).toBeTruthy();
    await waitFor(() => {
      expect(loadWatchlistIds()).toEqual([7]);
    });
  });
});
