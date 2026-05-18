/**
 * Testnet Warning Banner Component
 * 
 * Persistent banner shown when connected to testnet
 */

import { useState } from 'react';
import { useNetwork } from '../contexts/NetworkContext';

interface TestnetWarningBannerProps {
  dismissible?: boolean;
  showSwitchButton?: boolean;
}

export function TestnetWarningBanner({ 
  dismissible = true, 
  showSwitchButton = true 
}: TestnetWarningBannerProps) {
  const { isTestnet, setNetwork, networkConfig } = useNetwork();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show on testnet and when not dismissed
  if (!isTestnet || isDismissed) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-yellow-500/10 via-yellow-500/15 to-yellow-500/10 border-b border-yellow-500/30">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{networkConfig.icon}</span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-sm font-medium text-yellow-500">
              Testnet Mode Active
            </span>
            <span className="text-xs sm:text-sm text-yellow-500/70">
              Transactions use test tokens with no real value
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showSwitchButton && (
            <button
              onClick={() => setNetwork('mainnet')}
              className="hidden sm:block text-xs font-medium text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1 rounded-full transition-colors"
            >
              Switch to Mainnet
            </button>
          )}
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-yellow-500/70 hover:text-yellow-500 p-1 transition-colors"
              aria-label="Dismiss warning"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal testnet indicator for tight spaces
 */
export function TestnetLabel() {
  const { isTestnet, networkConfig } = useNetwork();
  
  if (!isTestnet) return null;
  
  return (
    <span 
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: `${networkConfig.color}20`,
        color: networkConfig.color,
      }}
    >
      {networkConfig.icon} Testnet
    </span>
  );
}

/**
 * Warning message for transaction forms
 */
export function TestnetTransactionWarning() {
  const { isTestnet, networkConfig } = useNetwork();
  
  if (!isTestnet) return null;
  
  return (
    <div 
      className="flex items-start gap-2 p-3 rounded-lg text-sm"
      style={{
        backgroundColor: `${networkConfig.color}10`,
        border: `1px solid ${networkConfig.color}30`,
      }}
    >
      <span className="text-base mt-0.5">{networkConfig.icon}</span>
      <div>
        <p className="font-medium" style={{ color: networkConfig.color }}>
          Testnet Transaction
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">
          This transaction will use testnet STX which has no real value. 
          Perfect for testing before using real tokens.
        </p>
      </div>
    </div>
  );
}
