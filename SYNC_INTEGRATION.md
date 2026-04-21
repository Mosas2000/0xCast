# Synchronization System Integration Guide

Complete guide for integrating the persistent data synchronization system into the 0xCast platform.

## Quick Start

### 1. Setup Provider

Wrap your application with the SyncProvider at the root level:

```typescript
// App.tsx
import { SyncProvider } from '@/context/SyncContext';

function App() {
  return (
    <SyncProvider 
      autoSync={true}
      syncInterval={30000}
      conflictResolution="merge"
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </SyncProvider>
  );
}

export default App;
```

### 2. Use in Components

Access sync functionality through hooks:

```typescript
// MyComponent.tsx
import { useSyncContext } from '@/context/SyncContext';
import { useSynchronization } from '@/hooks/useSyncHooks';

function MyComponent() {
  const { synchronize, stateManager } = useSyncContext();
  const { isSyncing, metrics } = useSynchronization();

  const handleSave = async (data: any) => {
    // Action is automatically queued if offline
    await synchronize();
  };

  return (
    <div>
      <SyncStatusIndicator />
      {isSyncing && <SyncProgressBar />}
    </div>
  );
}
```

## Integration Patterns

### Pattern 1: Entity Synchronization

Sync a specific entity after modification:

```typescript
import { useSyncContext } from '@/context/SyncContext';
import { useActionQueue } from '@/hooks/useSyncHooks';

function UserProfileEditor() {
  const { synchronize } = useSyncContext();
  const { addAction } = useActionQueue();

  const updateProfile = async (userId: string, updates: any) => {
    // Queue the action
    addAction(userId, 'user', 'update', updates);
    
    // Sync immediately or let auto-sync handle it
    await synchronize();
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateProfile(userId, formData);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Pattern 2: Batch Operations

Sync multiple entities in a single operation:

```typescript
async function updateMultipleEntities(updates: Map<string, any>) {
  const { queueService, synchronize } = useSyncContext();

  // Queue all actions
  for (const [entityId, data] of updates) {
    queueService.addAction(entityId, 'entity', 'update', data);
  }

  // Single sync operation
  await synchronize();
}
```

### Pattern 3: Offline-First

Handle offline scenarios gracefully:

```typescript
function OfflineAwareComponent() {
  const { stateManager } = useSyncContext();
  const { pendingCount } = useActionQueue();
  const status = stateManager.getStatus();

  return (
    <div>
      {status.isOffline && (
        <div className="offline-banner">
          Offline mode - {pendingCount} pending actions
        </div>
      )}
      {status.isOffline || <SyncStatusIndicator />}
    </div>
  );
}
```

### Pattern 4: Conflict Handling

Implement custom conflict resolution:

```typescript
function MarketTrading() {
  const { conflictService } = useSyncContext();
  const { conflicts, resolveConflict } = useConflictManagement();

  const handleConflict = (conflict: SyncConflict) => {
    // Custom logic - e.g., always use remote for price data
    if (conflict.fieldName === 'currentPrice') {
      resolveConflict(conflict.id, 'remote');
    } else {
      resolveConflict(conflict.id, 'merge');
    }
  };

  return (
    <div>
      {conflicts.length > 0 && (
        <ConflictResolver 
          conflicts={conflicts}
          onResolve={handleConflict}
        />
      )}
    </div>
  );
}
```

### Pattern 5: State Monitoring

Monitor synchronization health:

```typescript
function HealthDashboard() {
  const { metrics } = useSyncHealth();
  const { stateManager } = useSyncContext();

  return (
    <div>
      <div>Success Rate: {(metrics.successRate * 100).toFixed(2)}%</div>
      <div>Total Syncs: {metrics.totalSyncs}</div>
      <div>Failed Syncs: {metrics.failedSyncs}</div>
      <div>Last Sync: {new Date(metrics.lastSyncTime).toLocaleString()}</div>
    </div>
  );
}
```

## API Integration

### Connecting to Blockchain API

Update the BlockchainSyncService to use your API:

```typescript
// src/services/BlockchainSyncService.ts
async synchronize(): Promise<void> {
  try {
    // Fetch from blockchain
    const response = await fetch(
      `${API_URL}/api/entities/${entityType}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const remoteState = await response.json();
    
    // Continue with sync logic
  } catch (error) {
    // Handle API errors
  }
}
```

### Custom Entity Types

Support custom entity types:

```typescript
interface CustomEntity extends SyncEntity {
  customField?: string;
  metadata?: Record<string, any>;
}

// Register in SyncStateManager
stateManager.addEntityType('custom', {
  defaultValue: {},
  conflictResolution: 'merge'
});
```

## Storage Management

### Configure Storage Limits

```typescript
<SyncProvider
  storageConfig={{
    maxSize: 5242880, // 5MB
    cleanupThreshold: 0.9, // Clean when 90% full
    retentionDays: 30
  }}
>
  <App />
</SyncProvider>
```

### Monitor Storage Usage

```typescript
function StorageMonitor() {
  const { getStatistics } = useLocalStorage();
  const stats = getStatistics();

  return (
    <div>
      <div>Used: {(stats.usedSpace / 1024 / 1024).toFixed(2)} MB</div>
      <div>Total: {(stats.totalSpace / 1024 / 1024).toFixed(2)} MB</div>
      <ProgressBar 
        value={stats.usedSpace} 
        max={stats.totalSpace}
      />
    </div>
  );
}
```

## Testing Integration

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSynchronization } from '@/hooks/useSyncHooks';
import { SyncProvider } from '@/context/SyncContext';

describe('Synchronization', () => {
  it('should synchronize entities', async () => {
    const wrapper = ({ children }: any) => 
      <SyncProvider>{children}</SyncProvider>;

    const { result } = renderHook(() => useSynchronization(), { wrapper });

    await act(async () => {
      await result.current.synchronize();
    });

    expect(result.current.isSyncing).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Offline Sync', () => {
  it('should queue actions when offline', async () => {
    const { queueService, stateManager } = new SyncContext();
    
    // Simulate offline
    stateManager.updateStatus({ isOffline: true });

    const action = queueService.addAction('1', 'entity', 'update', {});
    expect(queueService.getPendingCount()).toBe(1);

    // Simulate online
    stateManager.updateStatus({ isOffline: false });
    // Auto-sync should trigger
  });
});
```

## Performance Optimization

### Batch Processing

```typescript
<SyncProvider
  batchConfig={{
    batchSize: 100,
    batchInterval: 5000
  }}
>
  <App />
</SyncProvider>
```

### Selective Sync

Only sync changed entities:

```typescript
const changedEntities = stateManager.getChangedEntities();
await synchronize({ entities: changedEntities });
```

### Compression

```typescript
<SyncProvider
  storageConfig={{ enableCompression: true }}
>
  <App />
</SyncProvider>
```

## Error Handling

### Global Error Handler

```typescript
function setupSyncErrorHandler(syncService: BlockchainSyncService) {
  syncService.subscribe('sync_error', (error) => {
    console.error('Sync error:', error);
    // Send to error tracking service
    errorTracker.captureException(error);
  });
}
```

### Retry Configuration

```typescript
<SyncProvider
  retryConfig={{
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  }}
>
  <App />
</SyncProvider>
```

## Monitoring and Debugging

### Enable Debug Logging

```typescript
<SyncProvider debug={true}>
  <App />
</SyncProvider>
```

### Metrics Collection

```typescript
function MetricsCollector() {
  const { metrics } = useSynchronization();
  const { getStatistics } = useLocalStorage();

  useEffect(() => {
    // Send metrics to analytics
    analytics.track('sync_metrics', {
      successRate: metrics.successRate,
      avgSyncTime: metrics.avgSyncTime,
      storageUsed: getStatistics().usedSpace
    });
  }, [metrics]);

  return null;
}
```

## Migration Guide

### Migrating Existing Data

```typescript
async function migrateExistingData() {
  const { stateManager, synchronize } = useSyncContext();

  // Load existing data
  const existingData = await loadFromLegacyStorage();

  // Add to sync state
  for (const entity of existingData) {
    stateManager.addEntity(entity);
  }

  // Sync to blockchain
  await synchronize();
}
```

## Advanced Patterns

### Custom Conflict Resolution

```typescript
class CustomConflictResolver extends ConflictResolutionService {
  resolveConflict(conflict: SyncConflict, strategy: string): any {
    if (conflict.type === 'market_price') {
      // Use highest price (for trading)
      return conflict.remoteData.price > conflict.localData.price
        ? conflict.remoteData
        : conflict.localData;
    }
    
    return super.resolveConflict(conflict, strategy);
  }
}
```

### Custom Queue Processing

```typescript
class CustomActionQueue extends ActionQueueService {
  async processQueue(batchSize: number): Promise<void> {
    const actions = this.getPendingActions().slice(0, batchSize);

    // Group by entity type
    const grouped = actions.reduce((acc, action) => {
      if (!acc[action.entityType]) acc[action.entityType] = [];
      acc[action.entityType].push(action);
      return acc;
    }, {} as Record<string, any[]>);

    // Process each group
    for (const [type, typeActions] of Object.entries(grouped)) {
      await this.processBatch(typeActions);
    }
  }
}
```

## Troubleshooting

### Actions Not Syncing

1. Check network connectivity
2. Verify API endpoints are accessible
3. Check queue status: `queueService.getPendingActions()`
4. Review error logs: `syncService.getErrors()`

### Storage Full

1. Enable compression: `enableCompression: true`
2. Reduce retention period
3. Clear old data: `storage.cleanup()`

### High Conflict Rate

1. Check concurrent modifications
2. Adjust conflict resolution strategy
3. Reduce sync interval for more frequent updates

## API Reference

See `SYNC_API_REFERENCE.md` for complete API documentation.

## Examples

See `examples/SyncExamples.tsx` for working examples.
