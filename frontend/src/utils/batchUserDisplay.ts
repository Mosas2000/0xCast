import { BatchStats } from '@/types/batch';

export class BatchUserDisplay {
  static formatSavingsForDisplay(savingsAmount: string, original: string): string {
    const savings = parseFloat(savingsAmount);
    const originalAmount = parseFloat(original);
    const percentage = ((savings / originalAmount) * 100).toFixed(1);

    if (savings >= 1000) {
      return `Save ${(savings / 1000).toFixed(2)}K (${percentage}%)`;
    }

    return `Save ${savings.toFixed(0)} (${percentage}%)`;
  }

  static getBatchSizeDescription(size: number): string {
    if (size <= 1) return 'Single transaction';
    if (size <= 5) return 'Small batch';
    if (size <= 15) return 'Medium batch';
    if (size <= 30) return 'Large batch';
    return 'Extra large batch';
  }

  static getEstimatedTimeDisplay(duration: number): string {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  }

  static createSavingsSummary(stats: BatchStats): string {
    return `
Transaction Batching Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Original Total Cost: ${stats.totalFeeOriginal}
Batched Total Cost: ${stats.totalFeeBatched}
Total Savings: ${stats.savingsAmount}
Savings Percentage: ${stats.savingsPercentage.toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transactions Batched: ${stats.transactionCount}
Average Cost Per Transaction: ${stats.averageFeePerTx}
    `.trim();
  }

  static getSavingsMessage(percentage: number): string {
    if (percentage >= 50) {
      return '🎉 Excellent savings! You\'re getting over 50% cost reduction.';
    }
    if (percentage >= 40) {
      return '✅ Great savings! You\'re getting over 40% cost reduction.';
    }
    if (percentage >= 30) {
      return '👍 Good savings! You\'re getting over 30% cost reduction.';
    }
    return '💡 Moderate savings. Consider batching more transactions.';
  }

  static getRecommendationMessage(
    currentSize: number,
    optimalSize: number
  ): string {
    if (currentSize >= optimalSize) {
      return `Your batch size (${currentSize}) is already optimal.`;
    }
    if (currentSize < optimalSize * 0.5) {
      return `Consider increasing batch size to ${optimalSize} for better savings.`;
    }
    return `Try batching ${optimalSize} transactions for maximum efficiency.`;
  }

  static getCongestionMessage(level: 'low' | 'medium' | 'high'): string {
    switch (level) {
      case 'low':
        return 'Network congestion is low. Good time to submit batches.';
      case 'medium':
        return 'Network congestion is moderate. Batching is recommended.';
      case 'high':
        return 'Network congestion is high. Wait for better conditions if possible.';
    }
  }
}

export class BatchProgressTracker {
  static calculateProgress(executed: number, total: number): number {
    if (total === 0) return 0;
    return (executed / total) * 100;
  }

  static getProgressStatus(executed: number, total: number): string {
    const progress = this.calculateProgress(executed, total);

    if (progress === 0) return 'pending';
    if (progress === 100) return 'completed';
    if (progress > 75) return 'nearly_complete';
    if (progress > 50) return 'halfway';
    if (progress > 25) return 'in_progress';
    return 'starting';
  }

  static formatProgressBar(executed: number, total: number, width: number = 20): string {
    const progress = this.calculateProgress(executed, total);
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${progress.toFixed(0)}%`;
  }

  static getTimeRemainingEstimate(
    startTime: number,
    executed: number,
    total: number
  ): number {
    if (executed === 0) return 0;

    const elapsed = Date.now() - startTime;
    const perItem = elapsed / executed;
    const remaining = (total - executed) * perItem;

    return Math.max(0, remaining);
  }

  static formatTimeRemaining(ms: number): string {
    if (ms === 0) return 'Calculating...';
    if (ms < 1000) return '< 1 second';
    if (ms < 60000) return `${Math.ceil(ms / 1000)} seconds`;
    if (ms < 3600000) return `${Math.ceil(ms / 60000)} minutes`;
    return `${Math.ceil(ms / 3600000)} hours`;
  }
}

export class BatchNotificationBuilder {
  static createSuccessNotification(costSavings: string, transactions: number): string {
    return `Successfully batched ${transactions} transactions and saved ${costSavings} in fees!`;
  }

  static createFailureNotification(error: string, batchId: string): string {
    return `Batch ${batchId} failed: ${error}. Initiating rollback...`;
  }

  static createRollbackNotification(batchId: string): string {
    return `Batch ${batchId} rolled back. Your state has been restored.`;
  }

  static createProgressNotification(executed: number, total: number): string {
    return `Processing batch: ${executed} of ${total} transactions completed.`;
  }

  static createOptimizationNotification(recommendation: string): string {
    return `💡 Optimization tip: ${recommendation}`;
  }

  static createCostSavingsNotification(percentage: number): string {
    return `You've achieved ${percentage.toFixed(1)}% cost savings through batching! 🎉`;
  }
}
