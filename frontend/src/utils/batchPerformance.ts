import { BatchRequest, BatchExecutionResult } from '@/types/batch';

export interface BatchPerformanceMetrics {
  batchId: string;
  submittedAt: number;
  executedAt: number;
  duration: number;
  transactionCount: number;
  gasUsed: string;
  costSavings: string;
  successRate: number;
  averageGasPerTransaction: string;
}

export class BatchPerformanceTracker {
  private static metrics: Map<string, BatchPerformanceMetrics> = new Map();
  private static submissionTimes: Map<string, number> = new Map();

  static recordSubmission(batchId: string): void {
    this.submissionTimes.set(batchId, Date.now());
  }

  static recordExecution(result: BatchExecutionResult): void {
    const submittedAt = this.submissionTimes.get(result.batchId);
    if (!submittedAt) return;

    const metrics: BatchPerformanceMetrics = {
      batchId: result.batchId,
      submittedAt,
      executedAt: Date.now(),
      duration: Date.now() - submittedAt,
      transactionCount: result.totalCount,
      gasUsed: result.gasUsed,
      costSavings: result.costSavings,
      successRate: (result.executedCount / result.totalCount) * 100,
      averageGasPerTransaction: (parseFloat(result.gasUsed) / result.totalCount).toString(),
    };

    this.metrics.set(result.batchId, metrics);
    this.submissionTimes.delete(result.batchId);
  }

  static getMetrics(batchId: string): BatchPerformanceMetrics | null {
    return this.metrics.get(batchId) || null;
  }

  static getAllMetrics(): BatchPerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  static getAverageMetrics(): {
    averageDuration: number;
    averageTransactionCount: number;
    averageSuccessRate: number;
    totalCostSavings: string;
  } {
    const allMetrics = this.getAllMetrics();
    if (allMetrics.length === 0) {
      return {
        averageDuration: 0,
        averageTransactionCount: 0,
        averageSuccessRate: 0,
        totalCostSavings: '0',
      };
    }

    const totalDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0);
    const totalTransactions = allMetrics.reduce((sum, m) => sum + m.transactionCount, 0);
    const totalSuccessRate = allMetrics.reduce((sum, m) => sum + m.successRate, 0);
    const totalCostSavings = allMetrics.reduce(
      (sum, m) => sum + parseFloat(m.costSavings),
      0
    ).toString();

    return {
      averageDuration: totalDuration / allMetrics.length,
      averageTransactionCount: totalTransactions / allMetrics.length,
      averageSuccessRate: totalSuccessRate / allMetrics.length,
      totalCostSavings,
    };
  }

  static clear(): void {
    this.metrics.clear();
    this.submissionTimes.clear();
  }
}

export class CostSavingsTracker {
  private static totalSavings: string = '0';
  private static batchSavings: Map<string, string> = new Map();
  private static transactionsSaved: number = 0;

  static recordSavings(batchId: string, costSavings: string, transactionCount: number): void {
    this.batchSavings.set(batchId, costSavings);
    this.totalSavings = (
      parseFloat(this.totalSavings) + parseFloat(costSavings)
    ).toString();
    this.transactionsSaved += transactionCount;
  }

  static getTotalSavings(): string {
    return this.totalSavings;
  }

  static getBatchSavings(batchId: string): string | null {
    return this.batchSavings.get(batchId) || null;
  }

  static getTransactionsSaved(): number {
    return this.transactionsSaved;
  }

  static getSavingsPercentage(originalCost: string): number {
    const original = parseFloat(originalCost);
    const saved = parseFloat(this.totalSavings);
    return (saved / original) * 100;
  }

  static getStats(): {
    totalSavings: string;
    batchesProcessed: number;
    transactionsSaved: number;
    averageSavingsPerBatch: string;
    averageSavingsPerTransaction: string;
  } {
    const batchCount = this.batchSavings.size;
    const averagePerBatch = batchCount > 0
      ? (parseFloat(this.totalSavings) / batchCount).toString()
      : '0';
    const averagePerTx = this.transactionsSaved > 0
      ? (parseFloat(this.totalSavings) / this.transactionsSaved).toString()
      : '0';

    return {
      totalSavings: this.totalSavings,
      batchesProcessed: batchCount,
      transactionsSaved: this.transactionsSaved,
      averageSavingsPerBatch: averagePerBatch,
      averageSavingsPerTransaction: averagePerTx,
    };
  }

  static clear(): void {
    this.totalSavings = '0';
    this.batchSavings.clear();
    this.transactionsSaved = 0;
  }
}

export class GasOptimizationAnalyzer {
  static analyzeOptimization(
    originalGas: string,
    batchedGas: string,
    transactionCount: number
  ): {
    gasReduction: string;
    percentageReduction: number;
    gasPerTransaction: string;
    optimizationEfficiency: number;
  } {
    const original = parseFloat(originalGas);
    const batched = parseFloat(batchedGas);
    const reduction = original - batched;
    const percentageReduction = (reduction / original) * 100;
    const gasPerTx = batched / transactionCount;
    const efficiency = percentageReduction > 30 ? 1 : percentageReduction > 20 ? 0.8 : 0.6;

    return {
      gasReduction: reduction.toString(),
      percentageReduction,
      gasPerTransaction: gasPerTx.toString(),
      optimizationEfficiency: efficiency,
    };
  }

  static recommendOptimization(
    currentBatchSize: number,
    currentGasUsage: string
  ): {
    recommendedSize: number;
    expectedImprovement: number;
    reason: string;
  } {
    if (currentBatchSize < 5) {
      return {
        recommendedSize: 10,
        expectedImprovement: 15,
        reason: 'Larger batches provide better gas efficiency',
      };
    }

    if (currentBatchSize > 30) {
      return {
        recommendedSize: 25,
        expectedImprovement: 5,
        reason: 'Current batch size is near optimal',
      };
    }

    return {
      recommendedSize: currentBatchSize,
      expectedImprovement: 0,
      reason: 'Batch size is within optimal range',
    };
  }
}
