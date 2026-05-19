/* eslint-disable react-refresh/only-export-components */
/**
 * Network Switch Confirmation Dialog
 * 
 * Modal shown when switching between mainnet and testnet
 */

import { useState } from 'react';
import { NetworkType, NETWORK_CONFIGS } from '../types/network';

interface NetworkSwitchDialogProps {
  isOpen: boolean;
  currentNetwork: NetworkType;
  targetNetwork: NetworkType;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NetworkSwitchDialog({
  isOpen,
  currentNetwork,
  targetNetwork,
  onConfirm,
  onCancel,
}: NetworkSwitchDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const currentConfig = NETWORK_CONFIGS[currentNetwork];
  const targetConfig = NETWORK_CONFIGS[targetNetwork];
  const isGoingToTestnet = targetNetwork === NetworkType.TESTNET;

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('0xcast_skip_network_confirm', 'true');
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
        role="presentation"
        tabIndex={-1}
      />
      
      {/* Dialog */}
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Switch Network</h2>
          <button 
            onClick={onCancel}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Network Change Visual */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center p-4 bg-neutral-800/50 rounded-xl">
            <span className="text-3xl mb-2">{currentConfig.icon}</span>
            <span className="text-sm text-neutral-400">Current</span>
            <span className="font-medium" style={{ color: currentConfig.color }}>
              {currentConfig.label}
            </span>
          </div>
          
          <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          
          <div className="flex flex-col items-center p-4 bg-neutral-800/50 rounded-xl">
            <span className="text-3xl mb-2">{targetConfig.icon}</span>
            <span className="text-sm text-neutral-400">Target</span>
            <span className="font-medium" style={{ color: targetConfig.color }}>
              {targetConfig.label}
            </span>
          </div>
        </div>

        {/* Warning for Testnet */}
        {isGoingToTestnet && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium text-yellow-500 mb-1">Testnet Mode</p>
                <p className="text-sm text-yellow-500/80">
                  Testnet uses test tokens that have no real value. 
                  Market data and balances will be different.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info for Mainnet */}
        {!isGoingToTestnet && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">✓</span>
              <div>
                <p className="font-medium text-emerald-500 mb-1">Production Mode</p>
                <p className="text-sm text-emerald-500/80">
                  You will be connected to the live Stacks network. 
                  Transactions use real STX tokens.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Don't show again */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-neutral-400">Don't show this again</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors"
            style={{ backgroundColor: targetConfig.color }}
          >
            Switch to {targetConfig.label}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if we should show the network switch dialog
 */
export function shouldShowNetworkSwitchDialog(): boolean {
  return localStorage.getItem('0xcast_skip_network_confirm') !== 'true';
}

/**
 * Reset the skip dialog preference
 */
export function resetNetworkSwitchDialogPreference(): void {
  localStorage.removeItem('0xcast_skip_network_confirm');
}
