# Batch Transaction Module

Complete transaction batching implementation achieving 30-50% cost reduction.

## Quick Start

```typescript
import { BatchTransactionService, BatchTransactionBuilder } from '@/batch';

const service = BatchTransactionService.getInstance();
const builder = service.createBatch(5);

builder.addStakeTransaction('1000', ['arg1']);
builder.addClaimTransaction(1, ['arg2']);

const batch = builder.build();
const batchId = await service.submitBatch(batch);
```

## Core Components

### Services
- `BatchTransactionService` - Main orchestration service
- Handles batch submission, execution, and monitoring

### Utilities
- `BatchTransactionBuilder` - Fluent API for building batches
- `FeeSavingsCalculator` - Cost optimization calculations
- `BatchQueueManager` - Priority queue with retry logic
- `BatchExecutor` - Atomic batch execution
- `BatchRollbackManager` - Rollback and recovery
- `BatchHistoryManager` - Execution history tracking
- `BatchConfigurationManager` - Configuration management
- `BatchOptimizationAnalyzer` - Strategy optimization
- `BatchAnalytics` - Performance reporting

### React Hooks
- `useBatchTransaction` - Batch submission and tracking
- `useBatchFeeCalculator` - Fee calculation UI integration
- `useBatchStatus` - Real-time batch status monitoring
- `useBatchQueue` - Queue statistics and monitoring

## Features

✅ **Batch Transaction Processing**
- Group up to 50 transactions
- Automatic queue management
- Retry with exponential backoff

✅ **Cost Optimization**
- 30-50% fee reduction
- Optimal batch size calculation
- Dynamic strategy selection

✅ **Atomic Execution**
- Transaction atomicity guaranteed
- State snapshot management
- Automatic rollback on failure

✅ **Monitoring & Analytics**
- Real-time execution tracking
- Performance metrics
- Historical analysis
- Predictive modeling

✅ **Error Handling**
- Comprehensive error logging
- Recovery strategies
- Graceful degradation

## Configuration

```typescript
import { BatchConfigurationManager } from '@/batch';

const config = BatchConfigurationManager.getConfig();
// {
//   maxBatchSize: 50,
//   maxRetries: 3,
//   retryDelayMs: 5000,
//   enableAutoSubmit: true,
//   enableRollback: true,
//   enablePerformanceTracking: true
// }

BatchConfigurationManager.setMaxBatchSize(100);
BatchConfigurationManager.setMaxRetries(5);
```

## Performance Metrics

The module tracks:
- Batch size
- Gas usage
- Cost savings
- Execution time
- Success/failure rate
- Error distribution

## Examples

### Calculate Savings
```typescript
import { FeeSavingsCalculator } from '@/batch';

const stats = FeeSavingsCalculator.calculateBatchStats(20);
console.log(stats.savingsPercentage); // e.g., 45.2%
```

### Track History
```typescript
import { BatchHistoryManager } from '@/batch';

const history = BatchHistoryManager.getAllEntries();
const stats = BatchHistoryManager.getStats();
```

### Generate Analytics
```typescript
import { BatchAnalytics } from '@/batch';

const report = BatchAnalytics.generateReport(entries);
const trends = BatchAnalytics.identifyTrends(entries);
```

### Display Savings
```typescript
import { BatchUserDisplay } from '@/batch';

const message = BatchUserDisplay.formatSavingsForDisplay('500', '1000');
// "Save 500 (50%)"
```

## Testing

All components are thoroughly tested:
- Unit tests for each utility
- Integration tests for workflows
- Mock batch execution
- Performance benchmarks

Run tests:
```bash
npm run test -- batch
```

## Smart Contract

The `batch-transactions.clar` contract provides:
- `submit-batch` - Register batch
- `execute-batch` - Execute transactions
- `rollback-batch` - Recover state
- `finalize-batch` - Record results

## Architecture

```
BatchTransactionService (Orchestration)
├── BatchQueueManager (Queue)
├── BatchExecutor (Execution)
├── BatchRollbackManager (Recovery)
├── FeeSavingsCalculator (Optimization)
├── BatchHistoryManager (Tracking)
└── BatchPerformanceTracker (Metrics)
```

## Cost Analysis

**Individual (5 transactions):**
- Cost: 200 × 5 = 1,000 units

**Batched (5 transactions):**
- Cost: 500 + 30 × 4 = 620 units
- Savings: 380 units (38%)

## Best Practices

1. **Batch Size**: 10-30 transactions optimal
2. **Timing**: Submit during low congestion
3. **Monitoring**: Check status regularly
4. **Recovery**: Enable rollback for safety
5. **Analytics**: Review trends periodically

## Limitations

- Max batch size: 50 transactions
- Max queue size: 100 batches
- Max retries: 3 (configurable)
- Timeout: 1 day (144 blocks)

## Future Enhancements

- [ ] Cross-contract batching
- [ ] Dynamic fee calculation
- [ ] Multi-step batches
- [ ] Batch dependencies
- [ ] Advanced scheduling

## Support

For issues or questions:
1. Check batch history: `BatchHistoryManager.getAllEntries()`
2. Review error logs: `ErrorRecoveryManager.getStats()`
3. Check configuration: `BatchConfigurationManager.getConfigSummary()`
4. Review analytics: `BatchAnalytics.generateReport()`
