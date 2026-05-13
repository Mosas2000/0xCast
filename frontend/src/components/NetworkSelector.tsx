/**
 * Network Selector Component
 * 
 * Dropdown/button to switch between mainnet and testnet
 */

import { useState, useRef, useEffect } from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { NetworkType, NETWORK_CONFIGS } from '../types/network';

interface NetworkSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'compact';
  showLabel?: boolean;
}

export function NetworkSelector({ variant = 'dropdown', showLabel = true }: NetworkSelectorProps) {
  const { network, networkConfig, setNetwork, toggleNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle variant - simple button
  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleNetwork}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
        title={`Switch to ${network === NetworkType.MAINNET ? 'Testnet' : 'Mainnet'}`}
      >
        <span className="text-base">{networkConfig.icon}</span>
        {showLabel && (
          <span className="text-sm font-medium" style={{ color: networkConfig.color }}>
            {networkConfig.label}
          </span>
        )}
      </button>
    );
  }

  // Compact variant - icon only
  if (variant === 'compact') {
    return (
      <button
        onClick={toggleNetwork}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
        title={`${networkConfig.label} - Click to switch`}
      >
        <span className="text-sm">{networkConfig.icon}</span>
      </button>
    );
  }

  // Dropdown variant (default)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
        aria-label="Select network"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base">{networkConfig.icon}</span>
        {showLabel && (
          <span className="text-sm font-medium" style={{ color: networkConfig.color }}>
            {networkConfig.label}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-48 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden"
          role="listbox"
          aria-label="Network options"
        >
          <div className="p-2">
            <p className="text-xs text-neutral-600 dark:text-neutral-500 uppercase tracking-wider px-2 py-1">
              Select Network
            </p>
          </div>
          {Object.values(NETWORK_CONFIGS).map((config) => {
            const isSelected = network === config.name;
            return (
              <button
                key={config.name}
                onClick={() => {
                  setNetwork(config.name as NetworkType);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected 
                    ? 'bg-neutral-200 dark:bg-neutral-800' 
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black dark:text-white">{config.label}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-500 truncate">{config.apiUrl}</p>
                </div>
                {isSelected && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
          <div className="border-t border-neutral-800 p-3">
            <p className="text-xs text-neutral-500 text-center">
              {network === NetworkType.TESTNET 
                ? '⚠️ Testnet uses test tokens' 
                : '✓ Connected to production'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
