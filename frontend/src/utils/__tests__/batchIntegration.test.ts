import { describe, it, expect, beforeEach } from 'vitest';
import { BatchExecutor, AtomicBatchExecutor, BatchExecutionMonitor } from '@/utils/batchExecutor';
import { BatchRollbackManager, ErrorRecoveryManager, FailureRecoveryStrategy } from '@/utils/batchRollback';
import { BatchPerformanceTracker, CostSavingsTracker, GasOptimizationAnalyzer } from '@/utils/batchPerformance';
import { BatchHistoryManager, BatchStatisticsCalculator } from '@/utils/batchHistory';
import { BatchConfigurationManager } from '@/utils/batchConfiguration';
import { BatchTransactionBuilder } from '@/utils/batchTransactionUtils';

describe('BatchExecutor', () => {
  it('should calculate batch cost reduction', () => {
    const reduction = BatchExecutor.calculateBatchCostReduction(10);
    expect(reduction.percentage).toBeGreaterThan(0);
    expect(parseFloat(reduction.amount)).toBeGreaterThan(0);
  });

  it('should determine execution strategy', () => {
    const strategy = BatchExecutor.getExecutionStrategy(5);
    expect(strategy.batchSize).toBeGreaterThan(0);
    expect(strategy.expectedSavings).toBeGreaterThan(0);
  });
});

describe('AtomicBatchExecutor', () => {
  it('should execute atomically', async () => {
    const builder = new BatchTransactionBuilder();
    builder.addStakeTransaction('1000', ['arg']);
    const batch = builder.build();

    const result = await AtomicBatchExecutor.executeAtomically(batch);
    expect(result).toBeDefined();
  });
});

describe('BatchExecutionMonitor', () => {
  it('should monitor execution', () => {
    const batchId = 'test_batch_123';
    BatchExecutionMonitor.startMonitoring(batchId);
    
    setTimeout(() => {
      const metrics = BatchExecutionMonitor.stopMonitoring(batchId);
      expect(metrics?.duration).toBeGreaterThan(0);
    }, 100);
  });
});

describe('BatchRollbackManager', () => {
  it('should create snapshot', () => {
    const builder = new BatchTransactionBuilder();
    builder.addStakeTransaction('1000', ['arg']);
    const batch = builder.build();

    const snapshot = BatchRollbackManager.createSnapshot(batch);
    expect(snapshot.batchId).toBe(batch.id);
  });

  it('should create rollback record', () => {
    const builder = new BatchTransactionBuilder();
    builder.addStakeTransaction('1000', ['arg']);
    const batch = builder.build();

    BatchRollbackManager.createSnapshot(batch);
    const record = BatchRollbackManager.rollbackBatch(batch.id, 'test reason');
    
    expect(record.reason).toBe('test reason');
    expect(record.recoveryStatus).toBe('pending');
  });
});

describe('ErrorRecoveryManager', () => {
  it('should log error', () => {
    const error = new Error('Test error');
    ErrorRecoveryManager.logError('batch_1', error);
    
    const errors = ErrorRecoveryManager.getErrorsForBatch('batch_1');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should mark as recovered', () => {
    ErrorRecoveryManager.logError('batch_2', new Error('Test'));
    ErrorRecoveryManager.markAsRecovered('batch_2');
    
    const hasRecoverable = ErrorRecoveryManager.hasRecoverableError('batch_2');
    expect(hasRecoverable).toBe(false);
  });
});

describe('BatchPerformanceTracker', () => {
  it('should record metrics', () => {
    const result = {
      batchId: 'batch_1',
      txId: 'tx_1',
      status: 'success' as const,
      executedCount: 5,
      totalCount: 5,
      failedTransactions: [],
      gasUsed: '500',
      costSavings: '200',
    };

    BatchPerformanceTracker.recordSubmission('batch_1');
    BatchPerformanceTracker.recordExecution(result);
    
    const metrics = BatchPerformanceTracker.getMetrics('batch_1');
    expect(metrics).toBeDefined();
  });

  it('should calculate average metrics', () => {
    const average = BatchPerformanceTracker.getAverageMetrics();
    expect(average).toBeDefined();
  });
});

describe('CostSavingsTracker', () => {
  it('should record savings', () => {
    CostSavingsTracker.recordSavings('batch_1', '500', 10);
    
    const total = CostSavingsTracker.getTotalSavings();
    expect(parseFloat(total)).toBeGreaterThan(0);
  });

  it('should get statistics', () => {
    CostSavingsTracker.recordSavings('batch_2', '300', 5);
    
    const stats = CostSavingsTracker.getStats();
    expect(stats.batchesProcessed).toBeGreaterThan(0);
  });
});

describe('GasOptimizationAnalyzer', () => {
  it('should analyze optimization', () => {
    const analysis = GasOptimizationAnalyzer.analyzeOptimization('1000', '700', 10);
    expect(analysis.percentageReduction).toBeGreaterThan(0);
  });

  it('should recommend optimization', () => {
    const recommendation = GasOptimizationAnalyzer.recommendOptimization(5, '500');
    expect(recommendation.recommendedSize).toBeGreaterThan(0);
  });
});

describe('BatchHistoryManager', () => {
  beforeEach(() => {
    BatchHistoryManager.clearHistory();
  });

  it('should add entry', () => {
    const entry = {
      batchId: 'batch_1',
      createdAt: Date.now(),
      submittedAt: Date.now(),
      transactionCount: 5,
      status: 'confirmed',
      costSavings: '200',
      duration: 1000,
    };

    BatchHistoryManager.addEntry(entry);
    const retrieved = BatchHistoryManager.getEntry('batch_1');
    
    expect(retrieved?.batchId).toBe('batch_1');
  });

  it('should get stats', () => {
    const stats = BatchHistoryManager.getStats();
    expect(stats.totalBatches).toBeGreaterThanOrEqual(0);
  });
});

describe('BatchStatisticsCalculator', () => {
  it('should calculate success rate', () => {
    const entries = [
      {
        batchId: 'b1',
        createdAt: Date.now(),
        submittedAt: Date.now(),
        transactionCount: 5,
        status: 'confirmed',
        costSavings: '200',
        duration: 1000,
      },
    ];

    const rate = BatchStatisticsCalculator.calculateSuccessRate(entries);
    expect(rate).toBeGreaterThan(0);
  });

  it('should calculate daily stats', () => {
    const entries = [
      {
        batchId: 'b1',
        createdAt: Date.now(),
        submittedAt: Date.now(),
        transactionCount: 5,
        status: 'confirmed',
        costSavings: '200',
        duration: 1000,
      },
    ];

    const dailyStats = BatchStatisticsCalculator.getDailyStats(entries);
    expect(dailyStats.size).toBeGreaterThan(0);
  });
});

describe('BatchConfigurationManager', () => {
  it('should get config', () => {
    const config = BatchConfigurationManager.getConfig();
    expect(config.maxBatchSize).toBeGreaterThan(0);
  });

  it('should set config', () => {
    BatchConfigurationManager.setMaxBatchSize(40);
    const config = BatchConfigurationManager.getConfig();
    expect(config.maxBatchSize).toBe(40);
    
    BatchConfigurationManager.resetToDefaults();
  });

  it('should validate config', () => {
    const validation = BatchConfigurationManager.validateConfig({ maxBatchSize: 100 });
    expect(validation.valid).toBe(true);
  });
});

describe('FailureRecoveryStrategy', () => {
  it('should determine recovery strategy', () => {
    const strategy = FailureRecoveryStrategy.determineRecoveryStrategy(
      'batch_1',
      new Error('Test'),
      0,
      10
    );
    expect(strategy).toBe('abort');
  });

  it('should handle partial execution', async () => {
    const builder = new BatchTransactionBuilder();
    builder.addStakeTransaction('1000', ['arg']);
    const batch = builder.build();

    const success = await FailureRecoveryStrategy.executeRecoveryStrategy(
      'partial',
      'batch_1',
      batch
    );
    expect(typeof success).toBe('boolean');
  });
});
