import { 
  BatchRequest, 
  BatchStatus, 
  BatchExecutionResult,
  BatchQueueItem 
} from '@/types/batch';
import { BatchQueueManager } from '@/utils/batchQueueManager';
import { BatchTransactionBuilder, BatchValidator } from '@/utils/batchTransactionUtils';
import { FeeSavingsCalculator } from '@/utils/feeSavingsCalculator';
import { saveTransaction, updateTransactionStatus } from '@/utils/transactions';

export class BatchTransactionService {
  private static instance: BatchTransactionService;
  private queueManager: BatchQueueManager;
  private isProcessing: boolean = false;
  private processInterval: NodeJS.Timer | null = null;
  private failedBatches: Map<string, Error> = new Map();
  private completedBatches: Map<string, BatchExecutionResult> = new Map();

  private constructor() {
    this.queueManager = new BatchQueueManager();
    this.queueManager.setMaxQueueSize(100);
    this.queueManager.setMaxRetries(3);
    this.queueManager.setRetryDelayMs(5000);
  }

  static getInstance(): BatchTransactionService {
    if (!BatchTransactionService.instance) {
      BatchTransactionService.instance = new BatchTransactionService();
    }
    return BatchTransactionService.instance;
  }

  createBatch(transactionCount: number): BatchTransactionBuilder {
    return new BatchTransactionBuilder();
  }

  async submitBatch(batch: BatchRequest): Promise<string> {
    const validation = BatchValidator.validateBatch(batch);
    if (!validation.valid) {
      throw new Error(`Batch validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      this.queueManager.enqueue(batch, 5);
      batch.status = 'queued';
      
      if (!this.isProcessing) {
        this.startProcessing();
      }

      return batch.id;
    } catch (error) {
      throw new Error(`Failed to submit batch: ${error}`);
    }
  }

  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processInterval = setInterval(() => this.processBatches(), 1000);
  }

  private stopProcessing(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    this.isProcessing = false;
  }

  private async processBatches(): Promise<void> {
    if (this.queueManager.isEmpty()) {
      this.stopProcessing();
      return;
    }

    const item = this.queueManager.dequeue();
    if (!item) return;

    try {
      this.queueManager.updateBatchStatus(item.batch.id, 'processing');
      const result = await this.executeBatch(item.batch);
      
      this.completedBatches.set(item.batch.id, result);
      this.queueManager.updateBatchStatus(item.batch.id, 'confirmed');
      this.failedBatches.delete(item.batch.id);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.failedBatches.set(item.batch.id, err);

      if (!this.queueManager.retryBatch(item.batch.id)) {
        this.queueManager.updateBatchStatus(item.batch.id, 'failed');
        item.batch.error = err.message;
      } else {
        this.queueManager.updateBatchStatus(item.batch.id, 'rolled_back');
      }
    }
  }

  private async executeBatch(batch: BatchRequest): Promise<BatchExecutionResult> {
    const startTime = Date.now();
    const originalCost = FeeSavingsCalculator.calculateIndividualCost(batch.transactions.length);
    const batchedCost = FeeSavingsCalculator.calculateBatchedCost(batch.transactions.length);
    const costSavings = (parseFloat(originalCost) - parseFloat(batchedCost)).toString();

    const executedCount = batch.transactions.length;
    const failedTransactions: string[] = [];

    for (let i = 0; i < batch.transactions.length; i++) {
      try {
        const tx = batch.transactions[i];
        saveTransaction({
          txId: `${batch.id}_${i}`,
          type: tx.type as any,
          status: 'confirmed',
          timestamp: Date.now(),
          description: `Batch execution: ${tx.functionName}`,
        });
      } catch (error) {
        failedTransactions.push(batch.transactions[i].id);
      }
    }

    return {
      batchId: batch.id,
      txId: `batch_${Date.now()}`,
      status: failedTransactions.length === 0 ? 'success' : 'partial',
      executedCount: executedCount - failedTransactions.length,
      totalCount: batch.transactions.length,
      failedTransactions,
      gasUsed: batchedCost,
      costSavings,
    };
  }

  async getBatchStatus(batchId: string): Promise<BatchStatus | null> {
    const item = this.queueManager.getItem(batchId);
    return item ? item.batch.status : null;
  }

  async getBatchResult(batchId: string): Promise<BatchExecutionResult | null> {
    return this.completedBatches.get(batchId) || null;
  }

  async getBatchError(batchId: string): Promise<Error | null> {
    return this.failedBatches.get(batchId) || null;
  }

  getQueueStats() {
    return this.queueManager.getStats();
  }

  calculateBatchSavings(transactionCount: number) {
    return FeeSavingsCalculator.calculateBatchStats(transactionCount);
  }

  getOptimalBatchSize() {
    return FeeSavingsCalculator.calculateOptimalBatchSize(30);
  }

  isBatchingWorthwhile(transactionCount: number): boolean {
    return FeeSavingsCalculator.isBatchingWorthwhile(transactionCount, 30);
  }

  getRecommendedBatchSize(currentCount: number): number {
    return FeeSavingsCalculator.getRecommendedBatchSize(currentCount, 40);
  }

  getAllBatches(): BatchRequest[] {
    return this.queueManager.getAllBatches();
  }

  getPendingBatches(): BatchRequest[] {
    return this.queueManager.getPendingBatches();
  }

  getCompletedBatches(): BatchRequest[] {
    return this.queueManager.getCompletedBatches();
  }

  async cancelBatch(batchId: string): Promise<boolean> {
    const item = this.queueManager.getItem(batchId);
    if (!item) return false;

    if (['processing', 'submitted'].includes(item.batch.status)) {
      return false;
    }

    this.queueManager.remove(batchId);
    return true;
  }

  clearCompletedBatches(): void {
    this.completedBatches.clear();
    this.failedBatches.clear();
  }

  isProcessingActive(): boolean {
    return this.isProcessing;
  }

  setQueueSize(size: number): void {
    this.queueManager.setMaxQueueSize(size);
  }

  setMaxRetries(retries: number): void {
    this.queueManager.setMaxRetries(retries);
  }

  setRetryDelay(ms: number): void {
    this.queueManager.setRetryDelayMs(ms);
  }

  reset(): void {
    this.stopProcessing();
    this.queueManager.clear();
    this.failedBatches.clear();
    this.completedBatches.clear();
  }
}
