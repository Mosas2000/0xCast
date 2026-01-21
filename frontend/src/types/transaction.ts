/**
 * Transaction status enum
 */
export enum TransactionStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

/**
 * Transaction type enum
 */
export enum TransactionType {
    CREATE_MARKET = 'create-market',
    STAKE_YES = 'stake-yes',
    STAKE_NO = 'stake-no',
    CLAIM_WINNINGS = 'claim-winnings',
    RESOLVE_MARKET = 'resolve-market',
}

/**
 * Transaction metadata interface
 */
export interface TransactionMetadata {
    marketId?: number;
    amount?: number;
    outcome?: number;
    question?: string;
}

/**
 * Transaction interface
 */
export interface Transaction {
    txId: string;
    type: TransactionType;
    status: TransactionStatus;
    timestamp: number;
    confirmations?: number;
    metadata?: TransactionMetadata;
    error?: string;
}
