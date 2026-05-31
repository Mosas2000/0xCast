import { BatchRequest } from '@/types/batch';

export class BatchStrategyOptimizer {
  static analyzeTransactionPattern(transactions: BatchRequest[]): {
    commonType: string;
    avgBatchSize: number;
    optimalStrategy: string;
  } {
    if (transactions.length === 0) {
      return {
        commonType: 'unknown',
        avgBatchSize: 0,
        optimalStrategy: 'individual',
      };
    }

    const typeFrequency: { [key: string]: number } = {};
    for (const batch of transactions) {
      for (const tx of batch.transactions) {
        typeFrequency[tx.type] = (typeFrequency[tx.type] || 0) + 1;
      }
    }

    const commonType = Object.keys(typeFrequency).reduce((a, b) =>
      typeFrequency[a] > typeFrequency[b] ? a : b
    );

    const totalTxs = transactions.reduce((sum, b) => sum + b.transactions.length, 0);
    const avgBatchSize = totalTxs / transactions.length;

    let optimalStrategy = 'balanced';
    if (avgBatchSize < 5) optimalStrategy = 'speed';
    if (avgBatchSize > 20) optimalStrategy = 'cost';

    return { commonType, avgBatchSize, optimalStrategy };
  }

  static recommendBatchComposition(targetSavings: number): {
    stakePercentage: number;
    claimPercentage: number;
    tradePercentage: number;
    estimatedSavings: number;
  } {
    if (targetSavings >= 45) {
      return {
        stakePercentage: 40,
        claimPercentage: 40,
        tradePercentage: 20,
        estimatedSavings: 48,
      };
    }

    if (targetSavings >= 35) {
      return {
        stakePercentage: 35,
        claimPercentage: 35,
        tradePercentage: 30,
        estimatedSavings: 40,
      };
    }

    return {
      stakePercentage: 25,
      claimPercentage: 25,
      tradePercentage: 50,
      estimatedSavings: 32,
    };
  }
}

export class BatchPriorityCalculator {
  static calculatePriority(
    createdAt: number,
    transactionCount: number,
    estimatedCostSavings: number
  ): number {
    const ageMinutes = (Date.now() - createdAt) / (1000 * 60);
    const ageFactor = Math.min(ageMinutes * 0.1, 3);
    const sizeFactor = Math.min(transactionCount / 50 * 2, 2);
    const savingsFactor = (estimatedCostSavings / 100) * 3;

    return ageFactor + sizeFactor + savingsFactor;
  }

  static prioritizeBatches(batches: BatchRequest[]): BatchRequest[] {
    return batches.sort((a, b) => {
      const priorityA = this.calculatePriority(
        a.createdAt,
        a.transactions.length,
        30
      );
      const priorityB = this.calculatePriority(
        b.createdAt,
        b.transactions.length,
        30
      );
      return priorityB - priorityA;
    });
  }
}

export class BatchCapacityPlanner {
  static calculateNetworkCapacity(): {
    availableSlots: number;
    recommendedBatchSize: number;
    congestionLevel: 'low' | 'medium' | 'high';
  } {
    const currentLoad = Math.random() * 100;

    if (currentLoad < 30) {
      return {
        availableSlots: 1000,
        recommendedBatchSize: 50,
        congestionLevel: 'low',
      };
    }

    if (currentLoad < 70) {
      return {
        availableSlots: 500,
        recommendedBatchSize: 25,
        congestionLevel: 'medium',
      };
    }

    return {
      availableSlots: 100,
      recommendedBatchSize: 10,
      congestionLevel: 'high',
    };
  }

  static recommendBatchTiming(
    batchSize: number
  ): {
    immediateSubmission: boolean;
    waitTime: number;
    reason: string;
  } {
    const capacity = this.calculateNetworkCapacity();

    if (capacity.congestionLevel === 'low' && batchSize <= 30) {
      return {
        immediateSubmission: true,
        waitTime: 0,
        reason: 'Network has low congestion',
      };
    }

    if (capacity.congestionLevel === 'high') {
      return {
        immediateSubmission: false,
        waitTime: 60000,
        reason: 'High network congestion, wait for lower load',
      };
    }

    return {
      immediateSubmission: true,
      waitTime: 5000,
      reason: 'Standard submission timing',
    };
  }
}

export class BatchCompatibilityChecker {
  static canBatchTransactions(
    txTypes: string[]
  ): {
    compatible: boolean;
    incompatibilities: string[];
  } {
    const incompatibilities: string[] = [];

    const typeSet = new Set(txTypes);

    if (
      typeSet.has('stake') &&
      typeSet.has('unstake') &&
      typeSet.size === 2
    ) {
      incompatibilities.push('Stake and unstake cannot be batched together');
    }

    if (typeSet.has('approve') && typeSet.size > 1) {
      incompatibilities.push('Approve must be executed separately');
    }

    return {
      compatible: incompatibilities.length === 0,
      incompatibilities,
    };
  }

  static getOptimalBatchComposition(
    userTransactions: Array<{ type: string }>
  ): {
    batches: Array<string[]>;
    efficiency: number;
  } {
    const groups: { [key: string]: string[] } = {};

    for (const tx of userTransactions) {
      if (!groups[tx.type]) {
        groups[tx.type] = [];
      }
      groups[tx.type].push(tx.type);
    }

    const batches = Object.values(groups);
    const efficiency = (batches.length / userTransactions.length) * 100;

    return { batches, efficiency };
  }
}
