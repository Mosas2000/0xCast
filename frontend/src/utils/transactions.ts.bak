/**
 * Transaction Status Types and Utilities
 *
 * Provides types and functions for tracking transaction status on Stacks blockchain.
 */

import { getExplorerUrls } from '@/config/network';
import { getTransactionExplorerUrl, getAddressExplorerUrl } from './explorerLinks';
import type { NetworkType } from '@/types/network';
import { GDPRComplianceService } from '@/services/GDPRComplianceService';
import { SecureStorageV2Service } from '@/services/SecureStorageV2Service';

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

export async function getTransactionHistorySecure(): Promise<Transaction[]> {
  try {
    const stored = await SecureStorageV2Service.getItem<Transaction[]>(TX_HISTORY_KEY);
    if (stored) return stored;
    return getTransactionHistory();
  } catch {
    return getTransactionHistory();
  }
}

/**
 * Save transaction to history
 */
export function saveTransaction(tx: Transaction): void {
  const consentCheck = GDPRComplianceService.checkConsentForStorage(
    { transaction: tx },
    'necessary'
  );

  if (!consentCheck.allowed) {
    console.warn('Transaction storage blocked:', consentCheck.reason);
    return;
  }

  const history = getTransactionHistory();
  history.unshift(tx);
  const limitedHistory = history.slice(0, MAX_TX_HISTORY);

  localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(limitedHistory));

  SecureStorageV2Service.setItem(TX_HISTORY_KEY, limitedHistory, {
    encrypt: true,
    category: 'necessary',
    expiresIn: 365 * 24 * 60 * 60 * 1000,
    requireConsent: false,
  }).catch(error => {
    console.error('Failed to store transaction in secure storage:', error);
  });
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
  const consentCheck = GDPRComplianceService.checkConsentForStorage(
    { txId, status, blockHeight, error },
    'necessary'
  );

  if (!consentCheck.allowed) {
    console.warn('Transaction update blocked:', consentCheck.reason);
    return;
  }

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

    SecureStorageV2Service.setItem(TX_HISTORY_KEY, history, {
      encrypt: true,
      category: 'necessary',
      expiresIn: 365 * 24 * 60 * 60 * 1000,
      requireConsent: false,
    }).catch(err => {
      console.error('Failed to update transaction in secure storage:', err);
    });
  }
}

export function clearTransactionHistory(): void {
  localStorage.removeItem(TX_HISTORY_KEY);
  SecureStorageV2Service.removeItem(TX_HISTORY_KEY).catch(error => {
    console.error('Failed to clear transaction history from secure storage:', error);
  });
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
 * 
 * @param txId - Transaction ID to view
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Full URL to view the transaction on Hiro explorer
 */
export function getExplorerUrl(txId: string, network?: NetworkType): string {
  return getTransactionExplorerUrl(txId, network);
}

/**
 * Build explorer URL for an address
 * 
 * @param address - Stacks address to view
 * @param network - Network type (mainnet or testnet). If not provided, uses active network
 * @returns Full URL to view the address on Hiro explorer
 */
export function getExplorerAddressUrl(address: string, network?: NetworkType): string {
  return getAddressExplorerUrl(address, network);
}
