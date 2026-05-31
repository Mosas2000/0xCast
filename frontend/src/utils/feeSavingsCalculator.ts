import { BatchStats, OptimalBatchSize } from '@/types/batch';

const BASE_TX_COST = 200;
const BATCH_OVERHEAD = 500;
const GAS_PER_ADDITIONAL_TX = 30;

export class FeeSavingsCalculator {
  static calculateIndividualCost(transactionCount: number): string {
    const totalCost = BASE_TX_COST * transactionCount;
    return totalCost.toString();
  }

  static calculateBatchedCost(transactionCount: number): string {
    if (transactionCount <= 1) return BASE_TX_COST.toString();
    const totalCost = BATCH_OVERHEAD + (GAS_PER_ADDITIONAL_TX * (transactionCount - 1));
    return totalCost.toString();
  }

  static calculateBatchStats(transactionCount: number): BatchStats {
    const individualCost = parseFloat(this.calculateIndividualCost(transactionCount));
    const batchedCost = parseFloat(this.calculateBatchedCost(transactionCount));
    const savingsAmount = individualCost - batchedCost;
    const savingsPercentage = (savingsAmount / individualCost) * 100;

    return {
      totalFeeOriginal: individualCost.toString(),
      totalFeeBatched: batchedCost.toString(),
      savingsAmount: savingsAmount.toString(),
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
      transactionCount,
      averageFeePerTx: (batchedCost / transactionCount).toString(),
    };
  }

  static calculateOptimalBatchSize(targetMinimumSavings: number = 30): OptimalBatchSize {
    let optimalSize = 2;
    let maxSavings = 0;

    for (let size = 2; size <= 50; size++) {
      const stats = this.calculateBatchStats(size);
      if (stats.savingsPercentage >= targetMinimumSavings && stats.savingsPercentage > maxSavings) {
        optimalSize = size;
        maxSavings = stats.savingsPercentage;
      }
    }

    const stats = this.calculateBatchStats(optimalSize);
    return {
      size: optimalSize,
      estimatedGasSavings: Math.round(stats.savingsPercentage * 100) / 100,
      averageCostPerTx: stats.averageFeePerTx,
    };
  }

  static estimateTransactionCost(baseAmount: string): string {
    return BASE_TX_COST.toString();
  }

  static estimateBatchCost(transactionCount: number, baseAmount: string): string {
    return this.calculateBatchedCost(transactionCount);
  }

  static getSavingsBreakdown(transactionCount: number): {
    savings: string;
    percentage: number;
    costPerTx: string;
  } {
    const stats = this.calculateBatchStats(transactionCount);
    return {
      savings: stats.savingsAmount,
      percentage: stats.savingsPercentage,
      costPerTx: stats.averageFeePerTx,
    };
  }

  static isBatchingWorthwhile(transactionCount: number, minimumSavingsPercentage: number = 30): boolean {
    const stats = this.calculateBatchStats(transactionCount);
    return stats.savingsPercentage >= minimumSavingsPercentage;
  }

  static getRecommendedBatchSize(
    currentTransactionCount: number,
    targetSavings: number = 40
  ): number {
    if (currentTransactionCount >= 50) return 50;
    
    const optimalSize = this.calculateOptimalBatchSize(targetSavings);
    const current = this.calculateBatchStats(currentTransactionCount);

    if (current.savingsPercentage >= targetSavings) {
      return currentTransactionCount;
    }

    return optimalSize.size;
  }

  static formatCostForDisplay(cost: string): string {
    const value = parseFloat(cost);
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return `${value.toFixed(2)}`;
  }

  static calculateCostPercentageChange(original: string, batched: string): number {
    const originalVal = parseFloat(original);
    const batchedVal = parseFloat(batched);
    if (originalVal === 0) return 0;
    return ((originalVal - batchedVal) / originalVal) * 100;
  }
}
