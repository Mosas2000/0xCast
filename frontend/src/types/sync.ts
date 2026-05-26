import type { JsonValue } from './common';

export type SyncAction = 'create' | 'update' | 'delete';
export type ConflictResolution = 'local' | 'remote' | 'merge' | 'manual';
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

export interface SyncEntity {
  id: string;
  entityType: string;
  localVersion: number;
  remoteVersion: number;
  lastSyncTime: number;
  data: Record<string, JsonValue>;
  hash: string;
  type?: string;
  isSynced?: boolean;
  conflictCount?: number;
}

export interface SyncConflict {
  id: string;
  entityId: string;
  entityType: string;
  localVersion: number;
  remoteVersion: number;
  localData: Record<string, JsonValue>;
  remoteData: Record<string, JsonValue>;
  timestamp: number;
  resolution?: ConflictResolution;
  resolvedData?: Record<string, JsonValue>;
  type?: string;
}

export interface QueuedAction {
  id: string;
  entityId: string;
  entityType: string;
  action: SyncAction;
  payload: Record<string, JsonValue>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  lastAttempt?: number;
}

export interface SyncState {
  status: SyncStatus;
  lastSync: number;
  pendingActions: number;
  conflicts: number;
  isOffline: boolean;
  syncProgress: number;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  conflictResolution: ConflictResolution;
  maxQueueSize: number;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  enableCompression: boolean;
}

export interface SyncEvent {
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'conflict_detected' | 'action_queued' | 'action_synced' | 'offline' | 'online';
  timestamp: number;
  data?: Record<string, JsonValue>;
  error?: string;
}

export interface SyncMetrics {
  totalSyncAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsDetected: number;
  conflictsResolved: number;
  queuedActionsProcessed: number;
  averageSyncTime: number;
  lastSyncTime: number;
  dataSize: number;
  totalSyncs?: number;
  totalConflicts?: number;
  resolvedConflicts?: number;
  pendingConflicts?: number;
  totalActions?: number;
  processedActions?: number;
  failedActions?: number;
  avgSyncTime?: number;
  successRate?: number;
  lastErrorTime?: number;
}

export interface DataSnapshot {
  id: string;
  timestamp: number;
  entityType: string;
  data: Record<string, JsonValue>;
  hash: string;
}

export interface SyncDiff {
  fields: Record<string, {
    local: JsonValue;
    remote: JsonValue;
  }>;
  added: string[];
  removed: string[];
}
