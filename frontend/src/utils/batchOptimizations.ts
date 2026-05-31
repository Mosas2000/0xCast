import { BatchRequest, BatchExecutionResult } from '@/types/batch';

export class BatchCachingStrategy {
  private static cache: Map<string, any> = new Map();
  private static ttl: Map<string, number> = new Map();
  private static maxSize: number = 100;

  static get(key: string): any | null {
    const expiry = this.ttl.get(key);
    if (expiry && expiry < Date.now()) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  static set(key: string, value: any, ttlMs: number = 300000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.ttl.delete(firstKey);
      }
    }
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  static clear(): void {
    this.cache.clear();
    this.ttl.clear();
  }

  static getSize(): number {
    return this.cache.size;
  }
}

export class BatchDeduplication {
  private static processedBatches: Set<string> = new Set();
  private static duplicateCount: number = 0;

  static isDuplicate(batch: BatchRequest): boolean {
    const signature = this.generateSignature(batch);
    if (this.processedBatches.has(signature)) {
      this.duplicateCount++;
      return true;
    }
    return false;
  }

  static markAsProcessed(batch: BatchRequest): void {
    const signature = this.generateSignature(batch);
    this.processedBatches.add(signature);
  }

  static getDuplicateCount(): number {
    return this.duplicateCount;
  }

  static clear(): void {
    this.processedBatches.clear();
    this.duplicateCount = 0;
  }

  private static generateSignature(batch: BatchRequest): string {
    const txIds = batch.transactions.map(t => t.id).sort().join(':');
    return `${batch.id}:${txIds}`;
  }
}

export class BatchMetricsAggregator {
  private static metrics: Array<{
    timestamp: number;
    batchSize: number;
    gasUsed: string;
    duration: number;
  }> = [];

  static recordMetric(
    batchSize: number,
    gasUsed: string,
    duration: number
  ): void {
    this.metrics.push({
      timestamp: Date.now(),
      batchSize,
      gasUsed,
      duration,
    });
  }

  static getAverageMetrics(): {
    averageBatchSize: number;
    averageGasUsed: string;
    averageDuration: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageBatchSize: 0,
        averageGasUsed: '0',
        averageDuration: 0,
      };
    }

    const totalBatchSize = this.metrics.reduce((sum, m) => sum + m.batchSize, 0);
    const totalGas = this.metrics.reduce(
      (sum, m) => sum + parseFloat(m.gasUsed),
      0
    );
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      averageBatchSize: totalBatchSize / this.metrics.length,
      averageGasUsed: (totalGas / this.metrics.length).toString(),
      averageDuration: totalDuration / this.metrics.length,
    };
  }

  static getPeakMetrics(): {
    maxBatchSize: number;
    maxGasUsed: string;
    maxDuration: number;
  } {
    if (this.metrics.length === 0) {
      return { maxBatchSize: 0, maxGasUsed: '0', maxDuration: 0 };
    }

    return {
      maxBatchSize: Math.max(...this.metrics.map(m => m.batchSize)),
      maxGasUsed: Math.max(...this.metrics.map(m => parseFloat(m.gasUsed))).toString(),
      maxDuration: Math.max(...this.metrics.map(m => m.duration)),
    };
  }

  static clear(): void {
    this.metrics = [];
  }
}

export class BatchLoadBalancer {
  static calculateOptimalDistribution(
    totalTransactions: number,
    maxBatchSize: number = 50
  ): number[] {
    const batches: number[] = [];
    let remaining = totalTransactions;

    while (remaining > 0) {
      const size = Math.min(maxBatchSize, remaining);
      batches.push(size);
      remaining -= size;
    }

    return batches;
  }

  static distributeLoad(
    transactions: any[],
    batchSize: number
  ): any[][] {
    const batches: any[][] = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      batches.push(transactions.slice(i, i + batchSize));
    }

    return batches;
  }

  static balanceByPriority(
    items: Array<{ priority: number; data: any }>,
    batchSize: number
  ): any[][] {
    const sorted = items.sort((a, b) => b.priority - a.priority);
    return this.distributeLoad(
      sorted.map(item => item.data),
      batchSize
    );
  }
}
