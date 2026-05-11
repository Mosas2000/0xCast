import { useState, useEffect, useRef, useCallback } from 'react';
import { SyncState, SyncMetrics, SyncConflict } from '@/types/sync';
import { BlockchainSyncService } from '@/services/BlockchainSyncService';
import { SyncStateManager } from '@/services/SyncStateManager';
import { ActionQueueService } from '@/services/ActionQueueService';
import { ConflictResolutionService } from '@/services/ConflictResolutionService';
import { LocalStorageService } from '@/services/LocalStorageService';

export function useSyncState() {
  const [status, setStatus] = useState<SyncState>({
    status: 'synced',
    lastSync: Date.now(),
    pendingActions: 0,
    conflicts: 0,
    isOffline: false,
    syncProgress: 100,
  });

  const stateManagerRef = useRef(new SyncStateManager());

  useEffect(() => {
    const manager = stateManagerRef.current;

    const handleStatusChanged = (newStatus: SyncState) => {
      setStatus(newStatus);
    };

    manager.subscribe('status_changed', handleStatusChanged);

    return () => {
      manager.unsubscribe('status_changed', handleStatusChanged);
    };
  }, []);

  return {
    status,
    stateManager: stateManagerRef.current,
  };
}

export function useActionQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const queueRef = useRef(new ActionQueueService());

  useEffect(() => {
    const queue = queueRef.current;

    const handleQueueUpdate = () => {
      setPendingCount(queue.getPendingCount());
      setProcessingCount(queue.getProcessingCount());
    };

    queue.subscribe('action_queued', handleQueueUpdate);
    queue.subscribe('action_complete', handleQueueUpdate);
    queue.subscribe('action_failed', handleQueueUpdate);

    return () => {
      queue.unsubscribe('action_queued', handleQueueUpdate);
      queue.unsubscribe('action_complete', handleQueueUpdate);
      queue.unsubscribe('action_failed', handleQueueUpdate);
    };
  }, []);

  const addAction = useCallback(
    (entityId: string, entityType: string, action: string, payload: Record<string, unknown>) => {
      return queueRef.current.addAction(
        entityId,
        entityType,
        action as 'create' | 'update' | 'delete',
        payload
      );
    },
    []
  );

  return {
    pendingCount,
    processingCount,
    addAction,
    queue: queueRef.current,
  };
}

export function useSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SyncMetrics>({
    totalSyncAttempts: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    conflictsDetected: 0,
    conflictsResolved: 0,
    queuedActionsProcessed: 0,
    averageSyncTime: 0,
    lastSyncTime: 0,
    dataSize: 0,
  });

  const syncServiceRef = useRef<BlockchainSyncService | null>(null);
  const stateManagerRef = useRef(new SyncStateManager());
  const conflictServiceRef = useRef(new ConflictResolutionService());
  const queueRef = useRef(new ActionQueueService());

  useEffect(() => {
    const conflictService = conflictServiceRef.current;
    const stateManager = stateManagerRef.current;
    const queue = queueRef.current;

    syncServiceRef.current = new BlockchainSyncService(
      conflictService,
      stateManager,
      queue
    );

    const syncService = syncServiceRef.current;

    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = () => {
      setIsSyncing(false);
      setSyncError(null);
      setMetrics(stateManager.getMetrics());
    };
    const handleSyncError = (error: Error) => {
      setIsSyncing(false);
      setSyncError(error.message);
    };

    syncService.subscribe('sync_start', handleSyncStart);
    syncService.subscribe('sync_complete', handleSyncComplete);
    syncService.subscribe('sync_error', handleSyncError);

    return () => {
      syncService.unsubscribe('sync_start', handleSyncStart);
      syncService.unsubscribe('sync_complete', handleSyncComplete);
      syncService.unsubscribe('sync_error', handleSyncError);
    };
  }, []);

  const synchronize = useCallback(async () => {
    if (!syncServiceRef.current) return false;
    return await syncServiceRef.current.synchronize();
  }, []);

  const startAutoSync = useCallback(() => {
    syncServiceRef.current?.startAutoSync();
  }, []);

  const stopAutoSync = useCallback(() => {
    syncServiceRef.current?.stopAutoSync();
  }, []);

  return {
    isSyncing,
    syncError,
    metrics,
    synchronize,
    startAutoSync,
    stopAutoSync,
  };
}

export function useConflictManagement() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const conflictServiceRef = useRef(new ConflictResolutionService());

  const getConflicts = useCallback(() => {
    return conflictServiceRef.current.getAllResolvedConflicts();
  }, []);

  const resolveConflict = useCallback(
    (conflict: SyncConflict, strategy: 'local' | 'remote' | 'merge' | 'manual') => {
      const resolved = conflictServiceRef.current.resolveConflict(
        conflict,
        strategy
      );
      return resolved;
    },
    []
  );

  const clearConflict = useCallback((id: string) => {
    conflictServiceRef.current.clearResolvedConflict(id);
    setConflicts(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    conflicts: getConflicts(),
    resolveConflict,
    clearConflict,
  };
}

export function useSyncHealth() {
  const [health, setHealth] = useState({
    status: 'synced' as const,
    successRate: 100,
    conflictRate: 0,
    pendingCount: 0,
    isHealthy: true,
  });

  const stateManagerRef = useRef(new SyncStateManager());

  useEffect(() => {
    const manager = stateManagerRef.current;

    const updateHealth = () => {
      setHealth(manager.getSyncHealth());
    };

    manager.subscribe('status_changed', updateHealth);
    manager.subscribe('metrics_updated', updateHealth);

    return () => {
      manager.unsubscribe('status_changed', updateHealth);
      manager.unsubscribe('metrics_updated', updateHealth);
    };
  }, []);

  return health;
}

export function useLocalStorage() {
  const storageRef = useRef(new LocalStorageService());

  const saveEntity = useCallback((entity: Record<string, unknown>) => {
    return storageRef.current.saveEntity(entity);
  }, []);

  const getEntity = useCallback((id: string) => {
    return storageRef.current.getEntity(id);
  }, []);

  const getAllEntities = useCallback(() => {
    return storageRef.current.getAllEntities();
  }, []);

  const removeEntity = useCallback((id: string) => {
    return storageRef.current.removeEntity(id);
  }, []);

  const getStatistics = useCallback(() => {
    return storageRef.current.getStatistics();
  }, []);

  return {
    saveEntity,
    getEntity,
    getAllEntities,
    removeEntity,
    getStatistics,
  };
}
