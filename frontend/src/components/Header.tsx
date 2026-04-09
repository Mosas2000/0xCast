import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useWallet } from './WalletProvider';
import { formatAddress } from '../utils/helpers';
import { NetworkSelector } from './NetworkSelector';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useNetwork } from '../contexts/NetworkContext';

export function Header() {
  const location = useLocation();
  const { isConnected, address, connect, disconnect } = useWallet();
  const { isTestnet, networkConfig } = useNetwork();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/markets', label: 'Markets' },
    { path: '/create-market', label: 'Create', highlight: true },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/liquidity', label: 'Liquidity' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/transactions', label: 'Activity' },
    { path: '/token', label: 'OXC Token' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-b border-neutral-200 dark:border-white/5">
      <div className="container">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  item.highlight
                    ? 'px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700'
                    : location.pathname === item.path
                    ? 'text-black dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Network Selector */}
            <div className="hidden sm:block">
              <NetworkSelector variant="dropdown" showLabel={true} />
            </div>
            <div className="sm:hidden">
              <NetworkSelector variant="compact" />
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Wallet */}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: networkConfig.color }}
                    title={`Connected to ${networkConfig.label}`}
                  ></span>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono">
                    {formatAddress(address || '')}
                  </span>
                  {isTestnet && (
                    <span className="text-xs text-yellow-500 ml-1">(Test)</span>
                  )}
                </div>
                <button onClick={disconnect} className="btn btn-secondary btn-sm">
                  Disconnect
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => connect()} className="btn btn-primary btn-sm">
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-300 dark:border-neutral-800">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
