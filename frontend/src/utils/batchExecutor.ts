import { BatchRequest, BatchExecutionResult } from '@/types/batch';

export class BatchExecutor {
  static async simulateBatchExecution(batch: BatchRequest): Promise<BatchExecutionResult> {
    const startTime = Date.now();
    
    const originalCost = parseFloat(
      BatchExecutor.calculateIndividualTransactionCost(batch.transactions.length)
    );
    const batchedCost = parseFloat(
      BatchExecutor.calculateBatchedTransactionCost(batch.transactions.length)
    );
    const costSavings = (originalCost - batchedCost).toString();

    const executedCount = batch.transactions.length;
    const failedTransactions: string[] = [];

    for (const tx of batch.transactions) {
      try {
        await BatchExecutor.simulateTransactionExecution(tx);
      } catch (error) {
        failedTransactions.push(tx.id);
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      batchId: batch.id,
      txId: `batch_tx_${Date.now()}`,
      status: failedTransactions.length === 0 ? 'success' : failedTransactions.length < batch.transactions.length ? 'partial' : 'failed',
      executedCount: executedCount - failedTransactions.length,
      totalCount: batch.transactions.length,
      failedTransactions,
      gasUsed: batchedCost.toString(),
      costSavings,
    };
  }

  static async executeBatchTransactions(batch: BatchRequest): Promise<void> {
    const validationErrors: string[] = [];

    for (const tx of batch.transactions) {
      if (!tx.functionName || !tx.functionArgs) {
        validationErrors.push(`Invalid transaction ${tx.id}`);
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Batch execution validation failed: ${validationErrors.join(', ')}`);
    }

    for (const tx of batch.transactions) {
      try {
        await BatchExecutor.executeTransaction(tx);
      } catch (error) {
        console.error(`Failed to execute transaction ${tx.id}:`, error);
      }
    }
  }

  static calculateBatchCostReduction(transactionCount: number): {
    percentage: number;
    amount: string;
    costPerTransaction: string;
  } {
    const individual = parseFloat(
      BatchExecutor.calculateIndividualTransactionCost(transactionCount)
    );
    const batched = parseFloat(
      BatchExecutor.calculateBatchedTransactionCost(transactionCount)
    );
    const reduction = individual - batched;
    const percentage = (reduction / individual) * 100;

    return {
      percentage,
      amount: reduction.toString(),
      costPerTransaction: (batched / transactionCount).toString(),
    };
  }

  static getExecutionStrategy(transactionCount: number): {
    batchSize: number;
    expectedSavings: number;
    strategy: string;
  } {
    if (transactionCount <= 1) {
      return {
        batchSize: 1,
        expectedSavings: 0,
        strategy: 'individual',
      };
    }

    if (transactionCount <= 10) {
      return {
        batchSize: transactionCount,
        expectedSavings: 35,
        strategy: 'batch_small',
      };
    }

    if (transactionCount <= 30) {
      return {
        batchSize: 10,
        expectedSavings: 40,
        strategy: 'batch_medium',
      };
    }

    return {
      batchSize: 20,
      expectedSavings: 45,
      strategy: 'batch_large',
    };
  }

  private static calculateIndividualTransactionCost(count: number): string {
    return (count * 200).toString();
  }

  private static calculateBatchedTransactionCost(count: number): string {
    if (count === 0) return '0';
    if (count === 1) return '200';
    return (500 + (count - 1) * 30).toString();
  }

  private static async simulateTransactionExecution(tx: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 10);
    });
  }

  private static async executeTransaction(tx: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 50);
    });
  }
}

export class AtomicBatchExecutor {
  static async executeAtomically(batch: BatchRequest): Promise<BatchExecutionResult> {
    const snapshot = await AtomicBatchExecutor.createStateSnapshot(batch);

    try {
      const result = await BatchExecutor.simulateBatchExecution(batch);
      
      if (result.status === 'failed') {
        await AtomicBatchExecutor.rollbackToSnapshot(snapshot);
      }

      return result;
    } catch (error) {
      await AtomicBatchExecutor.rollbackToSnapshot(snapshot);
      throw error;
    }
  }

  private static async createStateSnapshot(batch: BatchRequest): Promise<any> {
    return {
      timestamp: Date.now(),
      batchId: batch.id,
      transactionCount: batch.transactions.length,
    };
  }

  private static async rollbackToSnapshot(snapshot: any): Promise<void> {
    console.log('Rolling back to snapshot:', snapshot);
  }
}

export class BatchExecutionMonitor {
  private static executionStartTime: Map<string, number> = new Map();
  private static executionMetrics: Map<string, any> = new Map();

  static startMonitoring(batchId: string): void {
    BatchExecutionMonitor.executionStartTime.set(batchId, Date.now());
  }

  static stopMonitoring(batchId: string): any {
    const startTime = BatchExecutionMonitor.executionStartTime.get(batchId);
    if (!startTime) return null;

    const duration = Date.now() - startTime;
    const metrics = {
      batchId,
      duration,
      startTime,
      endTime: Date.now(),
    };

    BatchExecutionMonitor.executionMetrics.set(batchId, metrics);
    BatchExecutionMonitor.executionStartTime.delete(batchId);

    return metrics;
  }

  static getMetrics(batchId: string): any {
    return BatchExecutionMonitor.executionMetrics.get(batchId);
  }

  static getAllMetrics(): any[] {
    return Array.from(BatchExecutionMonitor.executionMetrics.values());
  }

  static clearMetrics(): void {
    BatchExecutionMonitor.executionMetrics.clear();
    BatchExecutionMonitor.executionStartTime.clear();
  }
}
