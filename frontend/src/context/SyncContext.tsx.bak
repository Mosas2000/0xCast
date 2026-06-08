import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { BlockchainSyncService } from '@/services/BlockchainSyncService';
import { SyncStateManager } from '@/services/SyncStateManager';
import { ActionQueueService } from '@/services/ActionQueueService';
import { ConflictResolutionService } from '@/services/ConflictResolutionService';
import { LocalStorageService } from '@/services/LocalStorageService';
import { RetryService } from '@/services/RetryService';

interface SyncContextType {
  syncService: BlockchainSyncService;
  stateManager: SyncStateManager;
  queueService: ActionQueueService;
  conflictService: ConflictResolutionService;
  storageService: LocalStorageService;
  retryService: RetryService;
  synchronize: () => Promise<boolean>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
  autoSync?: boolean;
  syncInterval?: number;
  conflictResolution?: 'local' | 'remote' | 'merge' | 'manual';
}

export function SyncProvider({
  children,
  autoSync = true,
  syncInterval = 30000,
  conflictResolution = 'merge',
}: SyncProviderProps) {
  const syncServiceRef = useRef<BlockchainSyncService | null>(null);
  const stateManagerRef = useRef(new SyncStateManager());
  const queueServiceRef = useRef(new ActionQueueService());
  const conflictServiceRef = useRef(new ConflictResolutionService());
  const storageServiceRef = useRef(new LocalStorageService());
  const retryServiceRef = useRef(new RetryService());

  useEffect(() => {
    const stateManager = stateManagerRef.current;
    const queueService = queueServiceRef.current;
    const conflictService = conflictServiceRef.current;
    const storageService = storageServiceRef.current;

    stateManager.setConfig({
      autoSync,
      syncInterval,
      conflictResolution,
    });

    const syncService = new BlockchainSyncService(
      conflictService,
      stateManager,
      queueService
    );
    syncServiceRef.current = syncService;

    const loadPersistedData = () => {
      const entities = storageService.getAllEntities();
      entities.forEach(entity => {
        stateManager.setSyncEntity(entity.id, entity);
      });

      const actions = storageService.getAllQueuedActions();
      actions.forEach(action => {
        queueService.addAction(
          action.entityId,
          action.entityType,
          action.action,
          action.payload,
          action.maxRetries
        );
      });
    };

    loadPersistedData();

    if (autoSync) {
      syncService.startAutoSync();
    }

    return () => {
      syncService.stopAutoSync();
    };
  }, [autoSync, syncInterval, conflictResolution]);

  const synchronize = async () => {
    return await syncServiceRef.current!.synchronize();
  };

  const startAutoSync = () => {
    syncServiceRef.current?.startAutoSync();
  };

  const stopAutoSync = () => {
    syncServiceRef.current?.stopAutoSync();
  };

  const value: SyncContextType = {
    syncService: syncServiceRef.current!,
    stateManager: stateManagerRef.current,
    queueService: queueServiceRef.current,
    conflictService: conflictServiceRef.current,
    storageService: storageServiceRef.current,
    retryService: retryServiceRef.current,
    synchronize,
    startAutoSync,
    stopAutoSync,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext(): SyncContextType {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
}
