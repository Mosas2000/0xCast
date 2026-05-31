import { BatchRequest, BatchExecutionResult } from '@/types/batch';

export interface BatchHistoryEntry {
  batchId: string;
  createdAt: number;
  submittedAt: number;
  completedAt?: number;
  transactionCount: number;
  status: string;
  result?: BatchExecutionResult;
  costSavings: string;
  duration: number;
}

export class BatchHistoryManager {
  private static history: BatchHistoryEntry[] = [];
  private static maxHistorySize: number = 500;
  private static localStorageKey: string = 'batch_transaction_history';

  static addEntry(entry: BatchHistoryEntry): void {
    this.history.unshift(entry);
    
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    this.persistToStorage();
  }

  static getEntry(batchId: string): BatchHistoryEntry | null {
    return this.history.find(e => e.batchId === batchId) || null;
  }

  static getAllEntries(): BatchHistoryEntry[] {
    return [...this.history];
  }

  static getEntriesByStatus(status: string): BatchHistoryEntry[] {
    return this.history.filter(e => e.status === status);
  }

  static getEntriesByDateRange(startTime: number, endTime: number): BatchHistoryEntry[] {
    return this.history.filter(
      e => e.createdAt >= startTime && e.createdAt <= endTime
    );
  }

  static getRecentEntries(limit: number = 10): BatchHistoryEntry[] {
    return this.history.slice(0, limit);
  }

  static removeEntry(batchId: string): boolean {
    const index = this.history.findIndex(e => e.batchId === batchId);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.persistToStorage();
      return true;
    }
    return false;
  }

  static clearHistory(): void {
    this.history = [];
    this.clearStorage();
  }

  static getStats(): {
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    totalCostSavings: string;
    averageCostSavingsPerBatch: string;
  } {
    const completed = this.history.filter(e => e.status === 'confirmed');
    const totalSavings = completed.reduce(
      (sum, e) => sum + parseFloat(e.costSavings),
      0
    ).toString();

    return {
      totalBatches: this.history.length,
      completedBatches: completed.length,
      failedBatches: this.history.filter(e => e.status === 'failed').length,
      totalCostSavings: totalSavings,
      averageCostSavingsPerBatch: completed.length > 0
        ? (parseFloat(totalSavings) / completed.length).toString()
        : '0',
    };
  }

  static exportAsJSON(): string {
    return JSON.stringify(this.history, null, 2);
  }

  static importFromJSON(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.history = imported;
        this.persistToStorage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    if (this.history.length > size) {
      this.history = this.history.slice(0, size);
    }
  }

  private static persistToStorage(): void {
    try {
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(this.history)
      );
    } catch (error) {
      console.error('Failed to persist batch history:', error);
    }
  }

  private static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load batch history:', error);
    }
  }

  private static clearStorage(): void {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Failed to clear batch history storage:', error);
    }
  }

  static initializeFromStorage(): void {
    this.loadFromStorage();
  }
}

export class BatchStatisticsCalculator {
  static calculateAverageExecutionTime(entries: BatchHistoryEntry[]): number {
    if (entries.length === 0) return 0;
    const totalTime = entries.reduce((sum, e) => sum + e.duration, 0);
    return totalTime / entries.length;
  }

  static calculateAverageBatchSize(entries: BatchHistoryEntry[]): number {
    if (entries.length === 0) return 0;
    const totalTxs = entries.reduce((sum, e) => sum + e.transactionCount, 0);
    return totalTxs / entries.length;
  }

  static calculateSuccessRate(entries: BatchHistoryEntry[]): number {
    if (entries.length === 0) return 0;
    const successful = entries.filter(e => e.status === 'confirmed').length;
    return (successful / entries.length) * 100;
  }

  static calculateTotalSavings(entries: BatchHistoryEntry[]): string {
    const total = entries.reduce(
      (sum, e) => sum + parseFloat(e.costSavings),
      0
    );
    return total.toString();
  }

  static getDailyStats(entries: BatchHistoryEntry[]): Map<string, any> {
    const stats = new Map<string, any>();

    for (const entry of entries) {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      
      if (!stats.has(date)) {
        stats.set(date, {
          batchCount: 0,
          transactionCount: 0,
          totalSavings: 0,
          successCount: 0,
        });
      }

      const dayStats = stats.get(date);
      dayStats.batchCount++;
      dayStats.transactionCount += entry.transactionCount;
      dayStats.totalSavings += parseFloat(entry.costSavings);
      if (entry.status === 'confirmed') {
        dayStats.successCount++;
      }
    }

    return stats;
  }

  static getHourlyStats(entries: BatchHistoryEntry[]): Map<number, any> {
    const stats = new Map<number, any>();

    for (const entry of entries) {
      const hour = new Date(entry.createdAt).getHours();
      
      if (!stats.has(hour)) {
        stats.set(hour, {
          batchCount: 0,
          transactionCount: 0,
          totalSavings: 0,
        });
      }

      const hourStats = stats.get(hour);
      hourStats.batchCount++;
      hourStats.transactionCount += entry.transactionCount;
      hourStats.totalSavings += parseFloat(entry.costSavings);
    }

    return stats;
  }
}
