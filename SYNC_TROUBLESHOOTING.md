# Synchronization System Troubleshooting Guide

Comprehensive guide for diagnosing and resolving common issues with the data synchronization system.

## Common Issues and Solutions

### Issue 1: Actions Stuck in Queue

**Symptoms:**
- Pending actions count keeps increasing
- Actions not syncing even when online
- `PendingActionsPanel` shows actions with status 'processing'

**Root Causes:**
1. API endpoint unavailable
2. Network connectivity issues
3. Storage quota exceeded
4. Infinite retry loop

**Solutions:**

```typescript
// Check API connectivity
const testApi = async () => {
  try {
    const response = await fetch('https://api.0xcast.com/health');
    console.log('API Status:', response.status);
  } catch (error) {
    console.error('API unreachable:', error);
  }
};

// Check queue status
const checkQueue = () => {
  const { queueService } = useSyncContext();
  const pending = queueService.getPendingActions();
  
  pending.forEach(action => {
    console.log(`${action.id}: ${action.status} (Retries: ${action.retries})`);
  });
};

// Check storage
const checkStorage = () => {
  const { getStatistics } = useLocalStorage();
  const stats = getStatistics();
  console.log(`Storage: ${stats.usedSpace} / ${stats.totalSpace} bytes`);
};

// Clear stuck actions
const clearStuckActions = () => {
  const { queueService } = useSyncContext();
  const stuck = queueService.getPendingActions()
    .filter(a => a.status === 'processing' && a.retries > 10);
  
  stuck.forEach(action => {
    queueService.removeAction(action.id);
  });
};
```

**Prevention:**
- Monitor queue length regularly
- Set reasonable max retry limits
- Check API health before user-facing operations
- Implement auto-cleanup for old/failed actions

---

### Issue 2: High Conflict Rate

**Symptoms:**
- Frequent conflict detection
- Merge strategy not resolving cleanly
- Manual resolution needed often
- `ConflictResolver` UI appears frequently

**Root Causes:**
1. Concurrent modifications from multiple sources
2. Clock skew between client and server
3. Inappropriate conflict resolution strategy
4. Network latency causing stale data

**Solutions:**

```typescript
// Analyze conflict patterns
const analyzeConflicts = () => {
  const { conflictService } = useSyncContext();
  
  // Check conflict types
  const conflicts = conflictService.getConflictHistory();
  const byType = {
    dataMismatch: 0,
    versionMismatch: 0,
    both: 0
  };
  
  conflicts.forEach(c => {
    if (c.type === 'data_mismatch') byType.dataMismatch++;
    else if (c.type === 'version_mismatch') byType.versionMismatch++;
    else byType.both++;
  });
  
  console.log('Conflict Types:', byType);
};

// Adjust conflict resolution strategy
const useSmartStrategy = () => {
  // For price data: always use remote (blockchain is authoritative)
  // For user preferences: use merge strategy
  // For trading orders: use remote (for safety)
  
  const config = {
    'price': 'remote',
    'userPrefs': 'merge',
    'orders': 'remote'
  };
  
  return config;
};

// Implement last-write-wins strategy
const lastWriteWinsResolve = (conflict) => {
  const winner = conflict.localData.timestamp > conflict.remoteData.timestamp
    ? conflict.localData
    : conflict.remoteData;
  return winner;
};

// Add jitter to sync intervals to reduce collision
const staggeredSync = () => {
  const baseInterval = 30000;
  const jitter = Math.random() * 5000;
  return baseInterval + jitter;
};
```

**Prevention:**
- Use merge strategy for non-critical data
- Remote-priority strategy for blockchain-backed data
- Implement version timestamps for last-write-wins
- Reduce sync interval for frequently changing data
- Use optimistic locking for transactions

---

### Issue 3: Storage Quota Exceeded

**Symptoms:**
- Storage errors in console
- Actions not queueing
- "QuotaExceededError" in logs
- Storage-related exceptions

**Solutions:**

```typescript
// Monitor storage usage
const monitorStorage = () => {
  const { getStatistics } = useLocalStorage();
  const stats = getStatistics();
  const percentUsed = (stats.usedSpace / stats.totalSpace) * 100;
  
  if (percentUsed > 80) {
    console.warn('Storage usage critical:', percentUsed.toFixed(1) + '%');
    initiateCleanup();
  }
};

// Cleanup old data
const initiateCleanup = async () => {
  const { storageService } = useSyncContext();
  
  // Remove entities last synced > 30 days ago
  const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const allEntities = storageService.getAllEntities();
  const toDelete = allEntities.filter(e => {
    return (e.lastSyncTime || e.lastModified) < cutoffTime;
  });
  
  toDelete.forEach(e => storageService.deleteEntity(e.id));
  console.log(`Cleaned up ${toDelete.length} old entities`);
};

// Compress data before storage
const compressEntity = (entity) => {
  const dataStr = JSON.stringify(entity.data);
  // Use LZ compression or similar
  return {
    ...entity,
    data: compress(dataStr) // placeholder
  };
};

// Archive to IndexedDB (future enhancement)
const archiveToIndexedDB = async (entities) => {
  // Transfer old entities to IndexedDB for larger capacity
  const db = await openDatabase();
  const tx = db.transaction(['archive'], 'readwrite');
  const store = tx.objectStore('archive');
  
  entities.forEach(e => store.add(e));
};

// Clear browser cache
const clearCache = () => {
  // Clear old sync cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.startsWith('sync-')) {
          caches.delete(name);
        }
      });
    });
  }
};
```

**Prevention:**
- Implement automatic daily cleanup
- Archive entities older than 30 days
- Enable data compression for large datasets
- Use pagination for bulk operations
- Monitor storage metrics continuously
- Plan for IndexedDB migration

---

### Issue 4: Sync Taking Too Long

**Symptoms:**
- UI freezes during sync
- Sync operations take >5 seconds
- SyncProgressBar stuck for extended time
- Performance degradation

**Solutions:**

```typescript
// Analyze sync performance
const analyzePerformance = () => {
  const { metrics } = useSynchronization();
  
  console.log('Avg Sync Time:', metrics.avgSyncTime + 'ms');
  
  if (metrics.avgSyncTime > 5000) {
    console.warn('Sync is slow!');
    suggestOptimizations();
  }
};

// Optimize batch size
const optimizeBatchSize = () => {
  const { queueService } = useSyncContext();
  const pending = queueService.getPendingCount();
  
  // Reduce batch size if slow
  return pending > 1000 ? 50 : (pending > 500 ? 100 : 200);
};

// Identify large entities
const findLargeEntities = () => {
  const { stateManager } = useSyncContext();
  const entities = stateManager.getEntities();
  
  const large = entities
    .map(e => ({
      id: e.id,
      size: JSON.stringify(e).length
    }))
    .filter(e => e.size > 1048576) // >1MB
    .sort((a, b) => b.size - a.size);
  
  return large;
};

// Implement selective sync
const selectiveSync = async (entityTypes) => {
  const { synchronize } = useSyncContext();
  
  // Only sync specified types
  await synchronize(entityTypes);
};

// Use web workers for crypto operations
const useWebWorker = () => {
  // Offload heavy computations to worker
  const worker = new Worker('syncWorker.js');
  worker.postMessage({ entities: largeDataset });
  
  worker.onmessage = (e) => {
    console.log('Worker completed:', e.data);
  };
};

// Implement progressive sync
const progressiveSync = async () => {
  const { queueService } = useSyncContext();
  const pending = queueService.getPendingActions();
  
  // Sync high-priority first
  const high = pending.filter(a => a.priority === 'high');
  const normal = pending.filter(a => a.priority === 'normal');
  const low = pending.filter(a => a.priority === 'low');
  
  // Process in chunks with delays
  for (const batch of [high, normal, low]) {
    for (const action of batch) {
      await processAction(action);
      await sleep(100); // Allow UI updates
    }
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Prevention:**
- Monitor sync times with SyncMetricsDisplay
- Optimize batch sizes based on network speed
- Use selective sync for large datasets
- Implement incremental syncing
- Reduce entity size through normalization
- Consider pagination for large result sets

---

### Issue 5: Memory Leaks

**Symptoms:**
- Memory usage increases over time
- Performance degrades after long use
- DevTools memory heap grows
- Application becomes sluggish

**Solutions:**

```typescript
// Check for memory leaks
const debugMemory = () => {
  if (performance.memory) {
    console.log('Heap:', {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    });
  }
};

// Ensure proper cleanup in hooks
const useProperCleanup = () => {
  const { stateManager } = useSyncContext();
  
  useEffect(() => {
    const unsubscribe = stateManager.subscribe('status_changed', handleChange);
    
    return () => {
      unsubscribe(); // Important: unsubscribe on unmount
    };
  }, []);
};

// Clear old log entries
const manageLogSize = () => {
  const logger = new SyncLogger();
  
  if (logger.getLogs().length > 10000) {
    logger.clearLogs();
  }
};

// Limit error log size
const limitErrorLogs = (handler) => {
  const stats = handler.getStats();
  
  if (stats.total > 5000) {
    handler.clearErrorLog();
  }
};

// Cleanup timed subscriptions
const cleanupSubscriptions = () => {
  const { stateManager } = useSyncContext();
  
  // Remove old event listeners
  stateManager.clearOldListeners(7 * 24 * 60 * 60 * 1000); // 7 days
};
```

**Prevention:**
- Always unsubscribe from events in useEffect cleanup
- Limit log and history sizes
- Periodically clear old cached data
- Use WeakMap for internal caching
- Profile memory regularly with DevTools
- Implement automatic log rotation

---

## Debugging Checklist

```typescript
const debugChecklist = async () => {
  const checks = {
    apiConnectivity: () => fetch('https://api.0xcast.com/health'),
    queueStatus: () => queueService.getPendingCount(),
    storageStatus: () => getStatistics(),
    syncMetrics: () => metrics,
    conflictCount: () => conflictService.getConflictHistory().length,
    memoryUsage: () => performance.memory?.usedJSHeapSize,
    networkStatus: () => navigator.onLine
  };
  
  const results = {};
  for (const [key, fn] of Object.entries(checks)) {
    try {
      results[key] = await Promise.resolve(fn());
    } catch (e) {
      results[key] = `Error: ${e.message}`;
    }
  }
  
  return results;
};
```

## Performance Benchmarks

Expected performance metrics:

| Operation | Time | Notes |
|-----------|------|-------|
| Sync 100 entities | 200-500ms | Network dependent |
| Conflict detection | 10-50ms | Per entity |
| Merge resolution | 5-20ms | Field count dependent |
| Queue processing (10 items) | 100-300ms | Batch dependent |
| Storage write | <50ms | Per entity |
| Storage read | <10ms | Per entity |

## Getting Help

If issues persist:

1. Enable debug logging: `SyncProvider debug={true}`
2. Export diagnostics: `SyncDebugger.exportDiagnostics()`
3. Check error logs: `handler.getErrorLog()`
4. Review metrics: `useSyncHealth()`
5. Create GitHub issue with diagnostics

## Advanced Troubleshooting

See `SYNC_IMPLEMENTATION_SUMMARY.md` for technical details on:
- Service architecture
- Conflict resolution algorithms
- Storage management
- Retry mechanisms
- Circuit breaker patterns
