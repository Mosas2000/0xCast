/**
 * Transaction Status Types and Utilities
 *
 * Provides types and functions for tracking transaction status on Stacks blockchain.
 */

import { getExplorerUrls } from '../config/network';
import type { NetworkType } from '../types/network';

export const TransactionStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  DROPPED: 'dropped',
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export interface Transaction {
  txId: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  amount?: string;
  marketId?: number;
  description: string;
  blockHeight?: number;
  error?: string;
}

export type TransactionType = 
  | 'stake'
  | 'unstake'
  | 'predict_yes'
  | 'predict_no'
  | 'claim_winnings'
  | 'transfer'
  | 'create_market'
  | 'vote';

// Local storage key for transaction history
export const TX_HISTORY_KEY = 'oxcast_tx_history';

// Maximum number of transactions to store
export const MAX_TX_HISTORY = 50;

/**
 * Get transaction history from local storage
 */
export function getTransactionHistory(): Transaction[] {
  try {
    const stored = localStorage.getItem(TX_HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save transaction to history
 */
export function saveTransaction(tx: Transaction): void {
  const history = getTransactionHistory();
  
  // Add new transaction at the beginning
  history.unshift(tx);
  
  // Limit history size
  const limitedHistory = history.slice(0, MAX_TX_HISTORY);
  
  localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(limitedHistory));
}

/**
 * Update transaction status in history
 */
export function updateTransactionStatus(
  txId: string, 
  status: TransactionStatus,
  blockHeight?: number,
  error?: string
): void {
  const history = getTransactionHistory();
  const index = history.findIndex(tx => tx.txId === txId);
  
  if (index !== -1) {
    history[index] = {
      ...history[index],
      status,
      ...(blockHeight && { blockHeight }),
      ...(error && { error }),
    };
    localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(history));
  }
}

/**
 * Clear transaction history
 */
export function clearTransactionHistory(): void {
  localStorage.removeItem(TX_HISTORY_KEY);
}

/**
 * Get transactions by status
 */
export function getTransactionsByStatus(status: TransactionStatus): Transaction[] {
  return getTransactionHistory().filter(tx => tx.status === status);
}

/**
 * Get pending transactions
 */
export function getPendingTransactions(): Transaction[] {
  return getTransactionsByStatus(TransactionStatus.PENDING);
}

/**
 * Format transaction type for display
 */
export function formatTransactionType(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    stake: 'Stake OXC',
    unstake: 'Unstake OXC',
    predict_yes: 'Predict Yes',
    predict_no: 'Predict No',
    claim_winnings: 'Claim Winnings',
    transfer: 'Transfer',
    create_market: 'Create Market',
    vote: 'Governance Vote',
  };
  return labels[type] || type;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: '#F59E0B',
    [TransactionStatus.SUCCESS]: '#22C55E',
    [TransactionStatus.FAILED]: '#EF4444',
    [TransactionStatus.DROPPED]: '#6B7280',
  };
  return colors[status];
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    [TransactionStatus.PENDING]: 'Pending',
    [TransactionStatus.SUCCESS]: 'Confirmed',
    [TransactionStatus.FAILED]: 'Failed',
    [TransactionStatus.DROPPED]: 'Dropped',
  };
  return labels[status];
}

/**
 * Build explorer URL for transaction
 */
export function getExplorerUrl(txId: string, network?: NetworkType): string {
  return getExplorerUrls(network).tx(txId);
}

/**
 * Build explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, network?: NetworkType): string {
  return getExplorerUrls(network).address(address);
}
