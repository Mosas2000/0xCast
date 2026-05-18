/**
 * Transaction types and helpers for 0xCast SDK
 */

import type { Transaction, TransactionType, TransactionStatus } from './types.js';
import { getTransactionUrl } from './network.js';
import type { NetworkType } from './types.js';

export type { Transaction, TransactionType, TransactionStatus };

// ─── Labels ───────────────────────────────────────────────────────────────────

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  stake: 'Stake OXC',
  unstake: 'Unstake OXC',
  predict_yes: 'Predict Yes',
  predict_no: 'Predict No',
  claim_winnings: 'Claim Winnings',
  transfer: 'Transfer',
  create_market: 'Create Market',
  vote: 'Governance Vote',
};

const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pending',
  success: 'Confirmed',
  failed: 'Failed',
  dropped: 'Dropped',
};

const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  pending: '#F59E0B',
  success: '#22C55E',
  failed: '#EF4444',
  dropped: '#6B7280',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable label for a transaction type.
 */
export function formatTransactionType(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type] ?? type;
}

/**
 * Returns a human-readable label for a transaction status.
 */
export function formatTransactionStatus(status: TransactionStatus): string {
  return TRANSACTION_STATUS_LABELS[status] ?? status;
}

/**
 * Returns a hex color string for a transaction status (useful for UI badges).
 */
export function getStatusColor(status: TransactionStatus): string {
  return TRANSACTION_STATUS_COLORS[status];
}

/**
 * Returns the Hiro explorer URL for a transaction.
 */
export function getExplorerUrl(txId: string, network: NetworkType = 'mainnet'): string {
  return getTransactionUrl(txId, network);
}

/**
 * Returns true if the transaction is in a terminal state (no longer pending).
 */
export function isTerminalStatus(status: TransactionStatus): boolean {
  return status === 'success' || status === 'failed' || status === 'dropped';
}

/**
 * Returns true if the transaction succeeded.
 */
export function isSuccessful(tx: Transaction): boolean {
  return tx.status === 'success';
}

/**
 * Returns true if the transaction is still pending.
 */
export function isPending(tx: Transaction): boolean {
  return tx.status === 'pending';
}
