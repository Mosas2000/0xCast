# Synchronization System API Reference

Complete API documentation for all services, hooks, types, and utilities in the persistent data synchronization system.

## Type Definitions

### SyncEntity

```typescript
interface SyncEntity {
  id: string;
  type: string;
  data: Record<string, any>;
  localVersion: number;
  remoteVersion: number;
  hash: string;
  lastModified: number;
  lastSyncTime?: number;
  isSynced: boolean;
  conflictCount: number;
}
```

### SyncConflict

```typescript
interface SyncConflict {
  id: string;
  entityId: string;
  entityType: string;
  fieldName: string;
  localData: any;
  remoteData: any;
  localVersion: number;
  remoteVersion: number;
  type: 'data_mismatch' | 'version_mismatch' | 'both';
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}
```

### QueuedAction

```typescript
interface QueuedAction {
  id: string;
  entityId: string;
  entityType: string;
  action: 'create' | 'update' | 'delete';
  payload: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  retries: number;
  maxRetries: number;
  lastRetryTime?: number;
  createdAt: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
}
```

### SyncState

```typescript
interface SyncState {
  status: 'synced' | 'syncing' | 'error' | 'offline';
  isOffline: boolean;
  lastSyncTime: number;
  entities: Map<string, SyncEntity>;
  config: SyncConfig;
  metrics: SyncMetrics;
}
```

### SyncConfig

```typescript
interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  maxQueueSize: number;
  maxRetries: number;
  retryDelay: number;
  conflictResolution: 'local' | 'remote' | 'merge' | 'manual';
  batchSize: number;
  enableCompression: boolean;
}
```

### SyncMetrics

```typescript
interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalConflicts: number;
  resolvedConflicts: number;
  pendingConflicts: number;
  totalActions: number;
  processedActions: number;
  failedActions: number;
  avgSyncTime: number;
  lastSyncTime: number;
  lastErrorTime?: number;
  lastError?: string;
  successRate: number;
}
```

### SyncEvent

```typescript
interface SyncEvent {
  type: string;
  timestamp: number;
  data?: any;
  error?: Error;
}
```

### DataSnapshot

```typescript
interface DataSnapshot {
  id: string;
  timestamp: number;
  data: Record<string, any>;
  size: number;
  hash: string;
}
```

### SyncDiff

```typescript
interface SyncDiff {
  type: 'added' | 'removed' | 'modified';
  field: string;
  oldValue?: any;
  newValue?: any;
}
```

## Services

### ConflictResolutionService

#### Methods

##### `detectConflict(local: any, remote: any, localVersion: number, remoteVersion: number): boolean`

Detects if a conflict exists between local and remote data.

**Parameters:**
- `local` - Local data object
- `remote` - Remote data object
- `localVersion` - Version number of local data
- `remoteVersion` - Version number of remote data

**Returns:** `true` if conflict detected, `false` otherwise

**Example:**
```typescript
const hasConflict = conflictService.detectConflict(
  { name: 'John', age: 30 },
  { name: 'John', age: 31 },
  1,
  1
);
```

##### `resolveConflict(conflict: SyncConflict, strategy: string): any`

Resolves a conflict using specified strategy.

**Parameters:**
- `conflict` - The conflict to resolve
- `strategy` - Resolution strategy ('local', 'remote', 'merge', 'manual')

**Returns:** Resolved data

**Example:**
```typescript
const resolved = conflictService.resolveConflict(conflict, 'merge');
```

##### `calculateDiff(local: any, remote: any): SyncDiff[]`

Calculates field-level differences between objects.

**Parameters:**
- `local` - Local object
- `remote` - Remote object

**Returns:** Array of differences

**Example:**
```typescript
const diffs = conflictService.calculateDiff(localData, remoteData);
```

##### `getConflictHistory(entityId: string): SyncConflict[]`

Retrieves conflict history for an entity.

**Parameters:**
- `entityId` - Entity identifier

**Returns:** Array of past conflicts

### ActionQueueService

#### Methods

##### `addAction(entityId: string, entityType: string, action: string, payload: any, priority?: string): QueuedAction`

Adds action to queue.

**Parameters:**
- `entityId` - Entity identifier
- `entityType` - Type of entity
- `action` - Action type ('create', 'update', 'delete')
- `payload` - Action payload data
- `priority` - Optional priority level

**Returns:** Created QueuedAction

**Example:**
```typescript
const action = queue.addAction('user_1', 'user', 'update', {
  name: 'Updated Name'
});
```

##### `getPendingActions(entityType?: string): QueuedAction[]`

Gets pending actions.

**Parameters:**
- `entityType` - Optional filter by entity type

**Returns:** Array of pending actions

##### `processQueue(batchSize: number): Promise<void>`

Processes queued actions.

**Parameters:**
- `batchSize` - Number of actions to process per batch

**Returns:** Promise that resolves when processing complete

##### `getPendingCount(): number`

Gets count of pending actions.

**Returns:** Number of pending actions

### SyncStateManager

#### Methods

##### `updateStatus(status: Partial<SyncState>): void`

Updates synchronization status.

**Parameters:**
- `status` - Status updates

**Example:**
```typescript
manager.updateStatus({ status: 'syncing' });
```

##### `getStatus(): SyncState`

Gets current sync status.

**Returns:** Current SyncState

##### `getMetrics(): SyncMetrics`

Gets current metrics.

**Returns:** Current SyncMetrics

##### `addEntity(entity: SyncEntity): void`

Adds entity to sync state.

**Parameters:**
- `entity` - Entity to add

##### `updateEntity(entity: SyncEntity): void`

Updates entity in sync state.

**Parameters:**
- `entity` - Updated entity

##### `getEntity(id: string): SyncEntity | undefined`

Gets entity by ID.

**Parameters:**
- `id` - Entity ID

**Returns:** Entity or undefined

##### `subscribe(eventType: string, callback: Function): () => void`

Subscribes to state change events.

**Parameters:**
- `eventType` - Event type to listen for
- `callback` - Function to call on event

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = manager.subscribe('status_changed', (event) => {
  console.log('Status:', event.data);
});
```

### BlockchainSyncService

#### Methods

##### `synchronize(entities?: string[]): Promise<void>`

Performs full synchronization.

**Parameters:**
- `entities` - Optional array of entity IDs to sync

**Returns:** Promise that resolves when sync complete

**Example:**
```typescript
await syncService.synchronize();
```

##### `startAutoSync(): void`

Starts automatic synchronization at configured interval.

**Example:**
```typescript
syncService.startAutoSync();
```

##### `stopAutoSync(): void`

Stops automatic synchronization.

**Example:**
```typescript
syncService.stopAutoSync();
```

##### `getStatus(): SyncState`

Gets synchronization status.

**Returns:** Current SyncState

##### `getMetrics(): SyncMetrics`

Gets synchronization metrics.

**Returns:** Current SyncMetrics

### LocalStorageService

#### Methods

##### `saveEntity(entity: SyncEntity): void`

Saves entity to persistent storage.

**Parameters:**
- `entity` - Entity to save

**Example:**
```typescript
storage.saveEntity(entity);
```

##### `getEntity(id: string): SyncEntity | null`

Retrieves entity from storage.

**Parameters:**
- `id` - Entity ID

**Returns:** Entity or null

##### `getAllEntities(): SyncEntity[]`

Gets all stored entities.

**Returns:** Array of entities

##### `deleteEntity(id: string): void`

Deletes entity from storage.

**Parameters:**
- `id` - Entity ID

##### `getStatistics(): { usedSpace: number; totalSpace: number }`

Gets storage statistics.

**Returns:** Storage information

##### `cleanup(): void`

Cleans up old data to free storage.

### RetryService

#### Methods

##### `executeWithRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T>`

Executes function with automatic retries.

**Parameters:**
- `fn` - Function to execute
- `options` - Retry options

**Returns:** Promise of function result

**Example:**
```typescript
const result = await retryService.executeWithRetry(
  () => fetchData(),
  { maxAttempts: 5, baseDelay: 1000 }
);
```

## React Hooks

### useSyncState()

```typescript
const {
  status,
  stateManager,
  isOffline,
  lastSyncTime
} = useSyncState();
```

**Returns:**
- `status` - Current sync status
- `stateManager` - SyncStateManager instance
- `isOffline` - Whether offline
- `lastSyncTime` - Last sync timestamp

### useActionQueue()

```typescript
const {
  pendingCount,
  processingCount,
  failedCount,
  addAction,
  queue,
  getPendingActions
} = useActionQueue();
```

**Returns:**
- `pendingCount` - Number of pending actions
- `processingCount` - Number of processing actions
- `failedCount` - Number of failed actions
- `addAction` - Function to add action
- `queue` - ActionQueueService instance
- `getPendingActions` - Function to get pending actions

### useSynchronization()

```typescript
const {
  isSyncing,
  metrics,
  synchronize,
  syncService,
  autoSyncEnabled
} = useSynchronization();
```

**Returns:**
- `isSyncing` - Whether currently syncing
- `metrics` - Sync metrics
- `synchronize` - Function to trigger sync
- `syncService` - BlockchainSyncService instance
- `autoSyncEnabled` - Whether auto-sync is enabled

### useConflictManagement()

```typescript
const {
  conflicts,
  conflictCount,
  resolveConflict,
  getConflictHistory
} = useConflictManagement();
```

**Returns:**
- `conflicts` - Current conflicts
- `conflictCount` - Number of conflicts
- `resolveConflict` - Function to resolve conflict
- `getConflictHistory` - Function to get history

### useSyncHealth()

```typescript
const {
  status,
  successRate,
  isHealthy,
  metrics
} = useSyncHealth();
```

**Returns:**
- `status` - Health status
- `successRate` - Sync success rate
- `isHealthy` - Whether system is healthy
- `metrics` - Health metrics

### useLocalStorage()

```typescript
const {
  saveEntity,
  getEntity,
  getAllEntities,
  deleteEntity,
  getStatistics
} = useLocalStorage();
```

**Returns:**
- `saveEntity` - Save entity function
- `getEntity` - Get entity function
- `getAllEntities` - Get all entities function
- `deleteEntity` - Delete entity function
- `getStatistics` - Get storage stats function

## React Components

### SyncStatusIndicator

Displays synchronization status.

**Props:**
- `showDetails?: boolean` - Show detailed metrics

### SyncProgressBar

Shows sync progress.

**Props:**
- `height?: number` - Progress bar height
- `color?: string` - Bar color

### SyncMetricsDisplay

Displays sync metrics.

**Props:**
- `refreshInterval?: number` - Refresh frequency

### ConflictResolver

Interactive conflict resolution UI.

**Props:**
- `conflicts: SyncConflict[]` - Conflicts to resolve
- `onResolve: (id: string, strategy: string) => void` - Resolve callback

### PendingActionsPanel

Lists pending actions.

**Props:**
- `compact?: boolean` - Compact view

### SyncControlPanel

Sync controls (manual sync, auto-sync toggle).

**Props:**
- `onSync?: () => void` - Sync callback
- `showAutoSyncToggle?: boolean` - Show toggle

### OfflineIndicator

Shows offline status.

## Context

### SyncProvider

Provides sync services to application.

**Props:**
- `autoSync?: boolean` - Enable auto-sync (default: true)
- `syncInterval?: number` - Auto-sync interval ms (default: 30000)
- `children: ReactNode` - Child components

**Usage:**
```typescript
<SyncProvider autoSync={true} syncInterval={30000}>
  <App />
</SyncProvider>
```

### useSyncContext()

Access sync context.

**Returns:**
- `synchronize` - Sync function
- `stateManager` - State manager
- `conflictService` - Conflict service
- `queueService` - Queue service
- `storageService` - Storage service
- `retryService` - Retry service

## Error Types

### SyncError

Base error class for sync operations.

### ConflictError

Error during conflict detection/resolution.

### QueueError

Error in queue operations.

### StorageError

Error in storage operations.

## Constants

```typescript
SYNC_STATUS = {
  SYNCED: 'synced',
  SYNCING: 'syncing',
  ERROR: 'error',
  OFFLINE: 'offline'
};

CONFLICT_TYPE = {
  DATA_MISMATCH: 'data_mismatch',
  VERSION_MISMATCH: 'version_mismatch',
  BOTH: 'both'
};

RESOLUTION_STRATEGY = {
  LOCAL: 'local',
  REMOTE: 'remote',
  MERGE: 'merge',
  MANUAL: 'manual'
};

ACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
};
```

## Examples

See `SYNC_INTEGRATION.md` for integration examples and patterns.
