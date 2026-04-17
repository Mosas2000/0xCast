import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from '../Header';

vi.mock('../WalletProvider', () => ({
  useWallet: () => ({
    isConnected: false,
    address: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => ({
    isTestnet: false,
    networkConfig: {
      color: '#10B981',
      label: 'Mainnet',
    },
  }),
}));

vi.mock('../NetworkSelector', () => ({
  NetworkSelector: () => React.createElement('div', { 'data-testid': 'network-selector' }),
}));

vi.mock('../ThemeSwitcher', () => ({
  ThemeSwitcher: () => React.createElement('div', { 'data-testid': 'theme-switcher' }),
}));

describe('Header', () => {
  it('includes the watchlist navigation link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Watchlist' })).toHaveAttribute('href', '/watchlist');
    expect(screen.getByRole('link', { name: 'Recent' })).toHaveAttribute('href', '/recently-viewed');
  });
});
