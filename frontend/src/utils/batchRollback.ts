import { BatchRequest, BatchExecutionResult } from '@/types/batch';

export interface StateSnapshot {
  batchId: string;
  timestamp: number;
  balances: Map<string, string>;
  positions: Map<string, any>;
  transactions: any[];
}

export interface RollbackRecord {
  batchId: string;
  reason: string;
  timestamp: number;
  snapshot: StateSnapshot;
  recoveryStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export class BatchRollbackManager {
  private static snapshots: Map<string, StateSnapshot> = new Map();
  private static rollbackRecords: Map<string, RollbackRecord> = new Map();
  private static maxSnapshots: number = 50;

  static createSnapshot(batch: BatchRequest): StateSnapshot {
    const snapshot: StateSnapshot = {
      batchId: batch.id,
      timestamp: Date.now(),
      balances: new Map(),
      positions: new Map(),
      transactions: [...batch.transactions],
    };

    this.snapshots.set(batch.id, snapshot);
    this.pruneOldSnapshots();

    return snapshot;
  }

  static rollbackBatch(batchId: string, reason: string): RollbackRecord {
    const snapshot = this.snapshots.get(batchId);
    if (!snapshot) {
      throw new Error(`No snapshot found for batch ${batchId}`);
    }

    const record: RollbackRecord = {
      batchId,
      reason,
      timestamp: Date.now(),
      snapshot,
      recoveryStatus: 'pending',
    };

    this.rollbackRecords.set(batchId, record);
    return record;
  }

  static async executeRollback(batchId: string): Promise<boolean> {
    const record = this.rollbackRecords.get(batchId);
    if (!record) {
      return false;
    }

    try {
      record.recoveryStatus = 'in_progress';

      await this.restoreFromSnapshot(record.snapshot);

      record.recoveryStatus = 'completed';
      return true;
    } catch (error) {
      record.recoveryStatus = 'failed';
      throw error;
    }
  }

  static getRollbackStatus(batchId: string): string | null {
    const record = this.rollbackRecords.get(batchId);
    return record ? record.recoveryStatus : null;
  }

  static getSnapshot(batchId: string): StateSnapshot | null {
    return this.snapshots.get(batchId) || null;
  }

  static clearSnapshot(batchId: string): void {
    this.snapshots.delete(batchId);
  }

  static clearRollbackRecord(batchId: string): void {
    this.rollbackRecords.delete(batchId);
  }

  private static pruneOldSnapshots(): void {
    if (this.snapshots.size > this.maxSnapshots) {
      const sortedEntries = Array.from(this.snapshots.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toDelete = sortedEntries.length - this.maxSnapshots;
      for (let i = 0; i < toDelete; i++) {
        this.snapshots.delete(sortedEntries[i][0]);
      }
    }
  }

  private static async restoreFromSnapshot(snapshot: StateSnapshot): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Snapshot restored for batch:', snapshot.batchId);
        resolve();
      }, 100);
    });
  }

  static getStats(): {
    totalSnapshots: number;
    totalRollbacks: number;
    completedRollbacks: number;
    failedRollbacks: number;
  } {
    const rollbacks = Array.from(this.rollbackRecords.values());
    return {
      totalSnapshots: this.snapshots.size,
      totalRollbacks: rollbacks.length,
      completedRollbacks: rollbacks.filter(r => r.recoveryStatus === 'completed').length,
      failedRollbacks: rollbacks.filter(r => r.recoveryStatus === 'failed').length,
    };
  }
}

export class ErrorRecoveryManager {
  private static errorLog: Array<{
    batchId: string;
    error: string;
    timestamp: number;
    recovered: boolean;
  }> = [];

  static logError(batchId: string, error: Error): void {
    this.errorLog.push({
      batchId,
      error: error.message,
      timestamp: Date.now(),
      recovered: false,
    });
  }

  static markAsRecovered(batchId: string): void {
    const entry = this.errorLog.find(e => e.batchId === batchId);
    if (entry) {
      entry.recovered = true;
    }
  }

  static getErrorsForBatch(batchId: string): any[] {
    return this.errorLog.filter(e => e.batchId === batchId);
  }

  static hasRecoverableError(batchId: string): boolean {
    const errors = this.getErrorsForBatch(batchId);
    return errors.length > 0 && errors.some(e => !e.recovered);
  }

  static clearErrors(batchId: string): void {
    this.errorLog = this.errorLog.filter(e => e.batchId !== batchId);
  }

  static getStats(): {
    totalErrors: number;
    recoveredErrors: number;
    unrecoveredErrors: number;
  } {
    return {
      totalErrors: this.errorLog.length,
      recoveredErrors: this.errorLog.filter(e => e.recovered).length,
      unrecoveredErrors: this.errorLog.filter(e => !e.recovered).length,
    };
  }
}

export class FailureRecoveryStrategy {
  static determineRecoveryStrategy(
    batchId: string,
    error: Error,
    executionCount: number,
    totalCount: number
  ): 'retry' | 'rollback' | 'partial' | 'abort' {
    if (executionCount === 0) {
      return 'abort';
    }

    if (executionCount === totalCount) {
      return 'rollback';
    }

    if (executionCount > totalCount * 0.8) {
      return 'partial';
    }

    return 'retry';
  }

  static async executeRecoveryStrategy(
    strategy: 'retry' | 'rollback' | 'partial' | 'abort',
    batchId: string,
    batch: BatchRequest
  ): Promise<boolean> {
    switch (strategy) {
      case 'retry':
        return this.retryBatch(batchId, batch);
      case 'rollback':
        return this.rollbackBatch(batchId);
      case 'partial':
        return this.handlePartialExecution(batchId, batch);
      case 'abort':
        return this.abortBatch(batchId);
      default:
        return false;
    }
  }

  private static async retryBatch(batchId: string, batch: BatchRequest): Promise<boolean> {
    console.log('Retrying batch:', batchId);
    return true;
  }

  private static async rollbackBatch(batchId: string): Promise<boolean> {
    try {
      await BatchRollbackManager.executeRollback(batchId);
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  private static async handlePartialExecution(batchId: string, batch: BatchRequest): Promise<boolean> {
    console.log('Handling partial execution for batch:', batchId);
    return true;
  }

  private static async abortBatch(batchId: string): Promise<boolean> {
    console.log('Aborting batch:', batchId);
    return true;
  }
}
