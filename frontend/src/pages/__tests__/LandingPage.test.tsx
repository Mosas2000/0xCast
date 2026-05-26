import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from '../LandingPage';

vi.mock('../../components/WalletProvider', () => ({
  useWallet: () => ({
    connect: vi.fn(),
    isConnected: true,
  }),
}));

vi.mock('../../hooks/useMarkets', () => ({
  useMarkets: () => ({
    markets: [],
    isLoading: false,
  }),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => ({
    network: 'mainnet',
    contractAddress: 'SPMAINNETCONTRACT',
  }),
}));

vi.mock('../../contexts/RecentlyViewedContext', () => ({
  useRecentlyViewed: () => ({
    entries: [],
  }),
}));

describe('LandingPage', () => {
  it('renders the landing page hero and statistics successfully', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Verify main headline is present
    const headline = screen.getByText(/Predict the Future/i);
    expect(headline).toBeInTheDocument();

    // Verify Explore Markets CTA is present
    const exploreLink = screen.getByRole('link', { name: /Explore Markets/i });
    expect(exploreLink).toHaveAttribute('href', '/markets');

    // Verify statistics cards are rendered
    expect(screen.getByText('Markets')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  }, 20000);
});
