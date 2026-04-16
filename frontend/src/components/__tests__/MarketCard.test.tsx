import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MarketCard } from '../MarketCard';
import { WatchlistProvider } from '../../contexts/WatchlistContext';
import { MarketStatus, MarketOutcome } from '../../types/market';

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
    localStorage.clear();
  });

  it('toggles watchlist state without breaking the card link', () => {
    renderCard();

    expect(screen.getByRole('link', { name: /open market/i })).toHaveAttribute('href', '/trade/7');

    const button = screen.getByRole('button', { name: 'Add to watchlist' });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'Remove from watchlist' })).toBeTruthy();
    expect(localStorage.getItem('0xcast_watchlist')).toBe(JSON.stringify([7]));
  });
});
