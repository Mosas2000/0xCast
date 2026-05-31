import { PostConditionMode } from '@stacks/transactions';

export type BatchTransactionType = 
  | 'stake'
  | 'unstake'
  | 'claim'
  | 'trade'
  | 'transfer'
  | 'approve';

export interface BatchTransaction {
  id: string;
  type: BatchTransactionType;
  marketId?: number;
  amount: string;
  functionName: string;
  functionArgs: unknown[];
  postConditions?: unknown[];
  postConditionMode?: PostConditionMode;
  timestamp: number;
}

export interface BatchRequest {
  id: string;
  transactions: BatchTransaction[];
  status: BatchStatus;
  createdAt: number;
  submittedAt?: number;
  completedAt?: number;
  txId?: string;
  error?: string;
}

export type BatchStatus = 
  | 'pending'
  | 'queued'
  | 'processing'
  | 'submitted'
  | 'confirmed'
  | 'failed'
  | 'rolled_back';

export interface BatchStats {
  totalFeeOriginal: string;
  totalFeeBatched: string;
  savingsAmount: string;
  savingsPercentage: number;
  transactionCount: number;
  averageFeePerTx: string;
}

export interface OptimalBatchSize {
  size: number;
  estimatedGasSavings: number;
  averageCostPerTx: string;
}

export interface BatchExecutionResult {
  batchId: string;
  txId: string;
  status: 'success' | 'partial' | 'failed';
  executedCount: number;
  totalCount: number;
  failedTransactions: string[];
  gasUsed: string;
  costSavings: string;
}

export interface BatchQueueItem {
  id: string;
  batch: BatchRequest;
  priority: number;
  retryCount: number;
  nextRetryAt?: number;
}
