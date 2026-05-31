import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  BatchTransactionBuilder,
  BatchRequestManager,
  BatchValidator
} from '@/utils/batchTransactionUtils';
import { BatchQueueManager } from '@/utils/batchQueueManager';
import { FeeSavingsCalculator } from '@/utils/feeSavingsCalculator';
import { BatchTransactionService } from '@/services/BatchTransactionService';
import { BatchRequest, BatchTransaction } from '@/types/batch';

describe('BatchTransactionBuilder', () => {
  let builder: BatchTransactionBuilder;

  beforeEach(() => {
    builder = new BatchTransactionBuilder();
  });

  it('should create a new batch transaction builder', () => {
    expect(builder.isEmpty()).toBe(true);
  });

  it('should add stake transaction', () => {
    builder.addStakeTransaction('1000', ['arg1']);
    expect(builder.getTransactionCount()).toBe(1);
  });

  it('should add multiple transactions', () => {
    builder
      .addStakeTransaction('1000', ['arg1'])
      .addUnstakeTransaction('500', ['arg2'])
      .addClaimTransaction(1, ['arg3']);
    expect(builder.getTransactionCount()).toBe(3);
  });

  it('should build valid batch request', () => {
    builder.addStakeTransaction('1000', ['arg1']);
    const batch = builder.build();
    
    expect(batch.id).toBeDefined();
    expect(batch.transactions.length).toBe(1);
    expect(batch.status).toBe('pending');
  });

  it('should throw error when building empty batch', () => {
    expect(() => builder.build()).toThrow('Cannot build batch with no transactions');
  });

  it('should clear transactions', () => {
    builder.addStakeTransaction('1000', ['arg1']);
    builder.clear();
    expect(builder.isEmpty()).toBe(true);
  });
});

describe('BatchValidator', () => {
  let batch: BatchRequest;

  beforeEach(() => {
    const builder = new BatchTransactionBuilder();
    builder.addStakeTransaction('1000', ['arg1']);
    batch = builder.build();
  });

  it('should validate valid batch', () => {
    const result = BatchValidator.validateBatch(batch);
    expect(result.valid).toBe(true);
  });

  it('should reject batch with invalid transaction type', () => {
    batch.transactions[0].type = 'invalid' as any;
    const result = BatchValidator.validateTransactionTypes(batch);
    expect(result.valid).toBe(false);
  });

  it('should validate batch size limits', () => {
    const builder = new BatchTransactionBuilder();
    for (let i = 0; i < 60; i++) {
      builder.addStakeTransaction('1000', ['arg']);
    }
    const largeBatch = builder.build();
    
    const result = BatchValidator.validateBatchSize(largeBatch);
    expect(result.valid).toBe(false);
  });

  it('should validate transaction amounts', () => {
    batch.transactions[0].amount = 'invalid';
    const result = BatchValidator.validateTransactionAmounts(batch);
    expect(result.valid).toBe(false);
  });
});

describe('BatchQueueManager', () => {
  let queueManager: BatchQueueManager;
  let batch: BatchRequest;

  beforeEach(() => {
    queueManager = new BatchQueueManager();
    const builder = new BatchTransactionBuilder();
    builder.addStakeTransaction('1000', ['arg1']);
    batch = builder.build();
  });

  it('should enqueue batch', () => {
    const id = queueManager.enqueue(batch);
    expect(id).toBe(batch.id);
    expect(queueManager.size()).toBe(1);
  });

  it('should dequeue batch', () => {
    queueManager.enqueue(batch);
    const item = queueManager.dequeue();
    expect(item?.batch.id).toBe(batch.id);
  });

  it('should peek at queue', () => {
    queueManager.enqueue(batch);
    const item = queueManager.peek();
    expect(item?.batch.id).toBe(batch.id);
    expect(queueManager.size()).toBe(1);
  });

  it('should check if batch exists', () => {
    queueManager.enqueue(batch);
    expect(queueManager.contains(batch.id)).toBe(true);
  });

  it('should remove batch from queue', () => {
    queueManager.enqueue(batch);
    queueManager.remove(batch.id);
    expect(queueManager.size()).toBe(0);
  });

  it('should handle retries', () => {
    queueManager.enqueue(batch);
    const success = queueManager.retryBatch(batch.id);
    expect(success).toBe(true);
  });

  it('should get queue stats', () => {
    queueManager.enqueue(batch);
    const stats = queueManager.getStats();
    expect(stats.totalBatches).toBe(1);
  });
});

describe('FeeSavingsCalculator', () => {
  it('should calculate individual transaction cost', () => {
    const cost = FeeSavingsCalculator.calculateIndividualCost(5);
    expect(cost).toBe('1000');
  });

  it('should calculate batched cost', () => {
    const cost = FeeSavingsCalculator.calculateBatchedCost(5);
    expect(parseFloat(cost)).toBeLessThan(1000);
  });

  it('should calculate batch statistics', () => {
    const stats = FeeSavingsCalculator.calculateBatchStats(10);
    expect(stats.savingsPercentage).toBeGreaterThan(30);
    expect(stats.transactionCount).toBe(10);
  });

  it('should calculate optimal batch size', () => {
    const optimal = FeeSavingsCalculator.calculateOptimalBatchSize(30);
    expect(optimal.size).toBeGreaterThan(1);
    expect(optimal.estimatedGasSavings).toBeGreaterThanOrEqual(30);
  });

  it('should determine if batching is worthwhile', () => {
    const worthwhile = FeeSavingsCalculator.isBatchingWorthwhile(10, 30);
    expect(worthwhile).toBe(true);
  });

  it('should recommend batch size', () => {
    const recommended = FeeSavingsCalculator.getRecommendedBatchSize(5);
    expect(recommended).toBeGreaterThan(0);
  });

  it('should format cost for display', () => {
    const formatted = FeeSavingsCalculator.formatCostForDisplay('1500000');
    expect(formatted).toContain('M');
  });

  it('should calculate cost percentage change', () => {
    const change = FeeSavingsCalculator.calculateCostPercentageChange('1000', '700');
    expect(change).toBeGreaterThan(0);
  });
});

describe('BatchTransactionService', () => {
  let service: BatchTransactionService;
  let batch: BatchRequest;

  beforeEach(() => {
    service = BatchTransactionService.getInstance();
    service.reset();
    
    const builder = service.createBatch(5);
    builder.addStakeTransaction('1000', ['arg1']);
    batch = builder.build();
  });

  afterEach(() => {
    service.reset();
  });

  it('should create batch builder', () => {
    const builder = service.createBatch(10);
    expect(builder).toBeDefined();
  });

  it('should submit batch', async () => {
    const batchId = await service.submitBatch(batch);
    expect(batchId).toBe(batch.id);
  });

  it('should get queue statistics', () => {
    service.submitBatch(batch);
    const stats = service.getQueueStats();
    expect(stats.totalBatches).toBeGreaterThan(0);
  });

  it('should calculate batch savings', () => {
    const savings = service.calculateBatchSavings(10);
    expect(savings.savingsPercentage).toBeGreaterThan(0);
  });

  it('should get optimal batch size', () => {
    const optimal = service.getOptimalBatchSize();
    expect(optimal.size).toBeGreaterThan(0);
  });

  it('should determine if batching is worthwhile', () => {
    const worthwhile = service.isBatchingWorthwhile(10);
    expect(typeof worthwhile).toBe('boolean');
  });

  it('should get all batches', () => {
    service.submitBatch(batch);
    const batches = service.getAllBatches();
    expect(batches.length).toBeGreaterThan(0);
  });

  it('should get pending batches', () => {
    service.submitBatch(batch);
    const pending = service.getPendingBatches();
    expect(pending.length).toBeGreaterThan(0);
  });

  it('should handle batch cancellation', async () => {
    await service.submitBatch(batch);
    const cancelled = await service.cancelBatch(batch.id);
    expect(cancelled).toBe(true);
  });
});
