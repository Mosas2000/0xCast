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

describe('LandingPage', () => {
  it('links to the contract on the active network explorer', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const contractLink = screen.getByRole('link', { name: 'View Contract' });
    expect(contractLink).toHaveAttribute(
      'href',
      'https://explorer.hiro.so/address/SPMAINNETCONTRACT?chain=mainnet'
    );
  }, 20000);
});
