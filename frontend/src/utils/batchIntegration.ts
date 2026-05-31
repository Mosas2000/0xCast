import { BatchRequest, BatchExecutionResult } from '@/types/batch';

export class BatchIntegrationAdapter {
  static adaptFromLegacyFormat(legacyBatch: any): BatchRequest {
    return {
      id: legacyBatch.id || `batch_${Date.now()}`,
      transactions: (legacyBatch.actions || []).map((action: any, index: number) => ({
        id: `tx_${index}`,
        type: action.actionType || 'transfer',
        amount: action.amount || '0',
        functionName: action.functionName || 'transfer',
        functionArgs: action.args || [],
        timestamp: Date.now(),
      })),
      status: 'pending',
      createdAt: Date.now(),
    };
  }

  static adaptToLegacyFormat(batch: BatchRequest): any {
    return {
      id: batch.id,
      actions: batch.transactions.map(tx => ({
        actionType: tx.type,
        amount: tx.amount,
        functionName: tx.functionName,
        args: tx.functionArgs,
      })),
    };
  }

  static migrateExistingBatches(existingBatches: any[]): BatchRequest[] {
    return existingBatches.map(batch => this.adaptFromLegacyFormat(batch));
  }
}

export class BatchCompatibilityChecker {
  static isCompatible(batch: BatchRequest): { compatible: boolean; issues: string[] } {
    const issues: string[] = [];

    if (batch.transactions.length > 50) {
      issues.push('Batch exceeds maximum transaction count of 50');
    }

    for (const tx of batch.transactions) {
      if (!tx.type) {
        issues.push(`Transaction ${tx.id} missing type`);
      }

      if (!tx.functionName) {
        issues.push(`Transaction ${tx.id} missing function name`);
      }

      const amount = parseFloat(tx.amount);
      if (isNaN(amount) || amount < 0) {
        issues.push(`Transaction ${tx.id} has invalid amount`);
      }
    }

    return { compatible: issues.length === 0, issues };
  }

  static validateAgainstSchema(batch: BatchRequest, schema: any): boolean {
    try {
      for (const key of Object.keys(schema)) {
        if (!(key in batch)) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}

export class BatchEventEmitter {
  private static listeners: Map<string, Function[]> = new Map();

  static on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  static off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  static emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    for (const callback of callbacks) {
      callback(data);
    }
  }

  static once(event: string, callback: Function): void {
    const wrapper = (data: any) => {
      callback(data);
      this.off(event, wrapper);
    };

    this.on(event, wrapper);
  }

  static removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export class BatchStateManager {
  private static state: Map<string, any> = new Map();

  static setState(key: string, value: any): void {
    this.state.set(key, value);
  }

  static getState(key: string): any | null {
    return this.state.get(key) || null;
  }

  static updateState(key: string, updates: any): void {
    const current = this.state.get(key) || {};
    this.state.set(key, { ...current, ...updates });
  }

  static deleteState(key: string): void {
    this.state.delete(key);
  }

  static getAllState(): Map<string, any> {
    return new Map(this.state);
  }

  static clearState(): void {
    this.state.clear();
  }
}

export class BatchLogger {
  private static logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    data?: any;
  }> = [];

  private static maxLogs: number = 1000;

  static log(level: string, message: string, data?: any): void {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data,
    });

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  static info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  static error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  static debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  static getLogs(level?: string, limit?: number): any[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}
