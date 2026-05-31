import { BatchHistoryEntry } from '@/utils/batchHistory';

export class BatchAnalytics {
  static generateReport(entries: BatchHistoryEntry[]): {
    totalBatches: number;
    totalTransactions: number;
    totalCostSavings: string;
    averageSavingsPercentage: number;
    successRate: number;
    failureRate: number;
    averageBatchSize: number;
    averageExecutionTime: number;
  } {
    if (entries.length === 0) {
      return {
        totalBatches: 0,
        totalTransactions: 0,
        totalCostSavings: '0',
        averageSavingsPercentage: 0,
        successRate: 0,
        failureRate: 0,
        averageBatchSize: 0,
        averageExecutionTime: 0,
      };
    }

    const successful = entries.filter(e => e.status === 'confirmed');
    const failed = entries.filter(e => e.status === 'failed');
    const totalTxs = entries.reduce((sum, e) => sum + e.transactionCount, 0);
    const totalSavings = entries.reduce(
      (sum, e) => sum + parseFloat(e.costSavings),
      0
    );
    const totalTime = entries.reduce((sum, e) => sum + e.duration, 0);
    const individualCostPerTx = 200;
    const totalIndividualCost = totalTxs * individualCostPerTx;
    const avgSavingsPercentage = (totalSavings / totalIndividualCost) * 100;

    return {
      totalBatches: entries.length,
      totalTransactions: totalTxs,
      totalCostSavings: totalSavings.toString(),
      averageSavingsPercentage: avgSavingsPercentage,
      successRate: (successful.length / entries.length) * 100,
      failureRate: (failed.length / entries.length) * 100,
      averageBatchSize: totalTxs / entries.length,
      averageExecutionTime: totalTime / entries.length,
    };
  }

  static identifyTrends(entries: BatchHistoryEntry[]): {
    improvingPerformance: boolean;
    trend: 'improving' | 'declining' | 'stable';
    recommendation: string;
  } {
    if (entries.length < 2) {
      return {
        improvingPerformance: false,
        trend: 'stable',
        recommendation: 'Not enough data to identify trends',
      };
    }

    const recentHalf = entries.slice(0, Math.ceil(entries.length / 2));
    const olderHalf = entries.slice(Math.ceil(entries.length / 2));

    const recentAvgSavings = recentHalf.reduce(
      (sum, e) => sum + parseFloat(e.costSavings),
      0
    ) / recentHalf.length;

    const olderAvgSavings = olderHalf.reduce(
      (sum, e) => sum + parseFloat(e.costSavings),
      0
    ) / olderHalf.length;

    const improving = recentAvgSavings > olderAvgSavings;
    const trend = improving
      ? 'improving'
      : recentAvgSavings < olderAvgSavings
      ? 'declining'
      : 'stable';

    const recommendation =
      trend === 'improving'
        ? 'Continue current batching strategy'
        : trend === 'declining'
        ? 'Consider adjusting batch size or timing'
        : 'Current strategy is consistent';

    return { improvingPerformance: improving, trend, recommendation };
  }

  static predictFuturePerformance(
    entries: BatchHistoryEntry[],
    projectionMonths: number = 1
  ): {
    projectedSavings: string;
    confidence: number;
    baselineMonthlyRate: string;
  } {
    if (entries.length === 0) {
      return { projectedSavings: '0', confidence: 0, baselineMonthlyRate: '0' };
    }

    const report = this.generateReport(entries);
    const daysOfData = entries.length > 0
      ? (Date.now() - entries[entries.length - 1].createdAt) / (1000 * 60 * 60 * 24)
      : 1;

    const monthlyRate = (parseFloat(report.totalCostSavings) / daysOfData) * 30;
    const projectedSavings = (monthlyRate * projectionMonths).toString();
    const confidence = Math.min((entries.length / 100) * 100, 95);

    return {
      projectedSavings,
      confidence: Math.round(confidence),
      baselineMonthlyRate: monthlyRate.toString(),
    };
  }

  static identifyOptimizations(entries: BatchHistoryEntry[]): string[] {
    const recommendations: string[] = [];
    const report = this.generateReport(entries);

    if (report.averageBatchSize < 10) {
      recommendations.push('Increase average batch size for better savings');
    }

    if (report.failureRate > 10) {
      recommendations.push('High failure rate detected. Review error logs.');
    }

    if (report.successRate < 90) {
      recommendations.push('Consider adjusting batch timing or size');
    }

    if (report.averageSavingsPercentage < 30) {
      recommendations.push('Current savings below target. Optimize batch composition');
    }

    if (report.averageExecutionTime > 5000) {
      recommendations.push('Execution times are high. Consider smaller batches');
    }

    if (recommendations.length === 0) {
      recommendations.push('Current batching strategy is optimal');
    }

    return recommendations;
  }

  static compareBatches(
    batch1: BatchHistoryEntry,
    batch2: BatchHistoryEntry
  ): {
    savingsDifference: string;
    executionTimeDifference: number;
    efficiency: number;
  } {
    const savingsDiff = (
      parseFloat(batch1.costSavings) - parseFloat(batch2.costSavings)
    ).toString();
    const timeDiff = batch1.duration - batch2.duration;
    const efficiency =
      (parseFloat(batch1.costSavings) / batch1.duration) *
      (parseFloat(batch2.costSavings) / batch2.duration);

    return {
      savingsDifference: savingsDiff,
      executionTimeDifference: timeDiff,
      efficiency,
    };
  }

  static generateMetricsSnapshot(): {
    timestamp: number;
    metrics: {
      totalBatches: number;
      averageSavings: string;
      lastBatchTime: number;
    };
  } {
    return {
      timestamp: Date.now(),
      metrics: {
        totalBatches: 0,
        averageSavings: '0',
        lastBatchTime: 0,
      },
    };
  }

  static exportAnalyticsAsJSON(entries: BatchHistoryEntry[]): string {
    const report = this.generateReport(entries);
    const trends = this.identifyTrends(entries);
    const predictions = this.predictFuturePerformance(entries);
    const optimizations = this.identifyOptimizations(entries);

    const analytics = {
      generatedAt: new Date().toISOString(),
      report,
      trends,
      predictions,
      optimizations,
      entryCount: entries.length,
    };

    return JSON.stringify(analytics, null, 2);
  }
}

export class PerformanceBenchmark {
  private static benchmarks: { [key: string]: number[] } = {};

  static recordMetric(name: string, value: number): void {
    if (!this.benchmarks[name]) {
      this.benchmarks[name] = [];
    }
    this.benchmarks[name].push(value);
  }

  static getMetricStats(name: string): {
    min: number;
    max: number;
    average: number;
    median: number;
    stdDev: number;
  } | null {
    const values = this.benchmarks[name];
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance =
      values.reduce((sum, val) => sum + (val - average) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { min, max, average, median, stdDev };
  }

  static getAllBenchmarks(): { [key: string]: any } {
    const result: { [key: string]: any } = {};

    for (const [name, _] of Object.entries(this.benchmarks)) {
      const stats = this.getMetricStats(name);
      if (stats) result[name] = stats;
    }

    return result;
  }

  static clearBenchmarks(): void {
    this.benchmarks = {};
  }
}
