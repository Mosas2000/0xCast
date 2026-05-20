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

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        if (key === 'nav.watchlist') return 'Watchlist';
        if (key === 'nav.recent') return 'Recent';
        return key;
      },
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
      },
    }),
  };
});

vi.mock('../NetworkSelector', () => ({
  NetworkSelector: () => <div data-testid="network-selector" />,
}));

vi.mock('../ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
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
