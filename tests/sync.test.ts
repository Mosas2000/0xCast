import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolutionService } from '@/services/ConflictResolutionService';
import { ActionQueueService } from '@/services/ActionQueueService';
import { SyncStateManager } from '@/services/SyncStateManager';
import { LocalStorageService } from '@/services/LocalStorageService';
import { RetryService } from '@/services/RetryService';
import { BlockchainSyncService } from '@/services/BlockchainSyncService';

describe('ConflictResolutionService', () => {
  let service: ConflictResolutionService;

  beforeEach(() => {
    service = new ConflictResolutionService();
  });

  it('detects conflicts between local and remote data', () => {
    const local = { name: 'Alice', age: 30 };
    const remote = { name: 'Bob', age: 30 };

    const hasConflict = service.detectConflict(local, remote, 1, 1);
    expect(hasConflict).toBe(true);
  });

  it('detects no conflict when data is identical', () => {
    const data = { name: 'Alice', age: 30 };

    const hasConflict = service.detectConflict(data, data, 1, 1);
    expect(hasConflict).toBe(false);
  });

  it('calculates diff correctly', () => {
    const local = { name: 'Alice', age: 30, email: 'alice@test.com' };
    const remote = { name: 'Bob', age: 30 };

    const diff = service.calculateDiff(local, remote);
    expect(diff.added).toContain('email');
    expect(diff.removed.length).toBe(0);
    expect(diff.fields.name).toBeDefined();
  });

  it('resolves conflict with local strategy', () => {
    const conflict: any = {
      id: '1',
      localData: { value: 1 },
      remoteData: { value: 2 },
    };

    const resolved = service.resolveConflict(conflict, 'local');
    expect(resolved.value).toBe(1);
  });

  it('resolves conflict with remote strategy', () => {
    const conflict: any = {
      id: '1',
      localData: { value: 1 },
      remoteData: { value: 2 },
    };

    const resolved = service.resolveConflict(conflict, 'remote');
    expect(resolved.value).toBe(2);
  });

  it('hashes data correctly', () => {
    const data = { name: 'Alice' };
    const hash1 = service.hashData(data);
    const hash2 = service.hashData(data);

    expect(hash1).toBe(hash2);
  });

  it('validates resolution', () => {
    const conflict: any = {
      id: '1',
      localData: { name: 'Alice', age: 30 },
      remoteData: { name: 'Bob', age: 25 },
    };

    const validResolution = { name: 'Alice', age: 30 };
    const isValid = service.validateResolution(conflict, validResolution);

    expect(isValid).toBe(true);
  });
});

describe('ActionQueueService', () => {
  let service: ActionQueueService;

  beforeEach(() => {
    service = new ActionQueueService();
  });

  it('adds action to queue', () => {
    const action = service.addAction('id1', 'entity', 'create', { data: 'test' });

    expect(action).toBeDefined();
    expect(action.entityId).toBe('id1');
    expect(action.action).toBe('create');
  });

  it('retrieves action from queue', () => {
    const added = service.addAction('id1', 'entity', 'update', { data: 'test' });
    const retrieved = service.getAction(added.id);

    expect(retrieved).toEqual(added);
  });

  it('marks action as processing', () => {
    const action = service.addAction('id1', 'entity', 'create', { data: 'test' });
    service.markProcessing(action.id);

    const nextAction = service.getNextAction();
    expect(nextAction).toBeUndefined();
  });

  it('marks action as complete', () => {
    const action = service.addAction('id1', 'entity', 'create', { data: 'test' });
    service.markProcessing(action.id);
    service.markComplete(action.id);

    expect(service.getAction(action.id)).toBeUndefined();
  });

  it('retries failed action', () => {
    const action = service.addAction('id1', 'entity', 'create', { data: 'test' }, 2);
    service.markProcessing(action.id);

    const shouldRetry = service.markFailed(action.id, 'Network error', 0);
    expect(shouldRetry).toBe(true);
  });

  it('returns pending actions', () => {
    service.addAction('id1', 'entity', 'create', { data: 'test' });
    service.addAction('id2', 'entity', 'update', { data: 'test' });

    const pending = service.getPendingActions();
    expect(pending.length).toBe(2);
  });

  it('clears queue', () => {
    service.addAction('id1', 'entity', 'create', { data: 'test' });
    service.clearQueue();

    expect(service.getPendingCount()).toBe(0);
  });
});

describe('SyncStateManager', () => {
  let service: SyncStateManager;

  beforeEach(() => {
    service = new SyncStateManager();
  });

  it('sets and gets sync entity', () => {
    const entity: any = {
      id: '1',
      entityType: 'user',
      localVersion: 1,
      remoteVersion: 1,
      lastSyncTime: Date.now(),
      data: { name: 'Alice' },
      hash: 'abc123',
    };

    service.setSyncEntity('1', entity);
    const retrieved = service.getSyncEntity('1');

    expect(retrieved).toEqual(entity);
  });

  it('updates sync status', () => {
    service.updateStatus({ status: 'syncing', pendingActions: 5 });
    const status = service.getStatus();

    expect(status.status).toBe('syncing');
    expect(status.pendingActions).toBe(5);
  });

  it('records sync attempt', () => {
    const initialMetrics = service.getMetrics();
    service.recordSyncAttempt(true, 100);

    const updatedMetrics = service.getMetrics();
    expect(updatedMetrics.totalSyncAttempts).toBe(initialMetrics.totalSyncAttempts + 1);
    expect(updatedMetrics.successfulSyncs).toBe(initialMetrics.successfulSyncs + 1);
  });

  it('calculates sync success rate', () => {
    service.recordSyncAttempt(true, 100);
    service.recordSyncAttempt(true, 100);
    service.recordSyncAttempt(false, 100);

    const rate = service.getSyncSuccessRate();
    expect(rate).toBeCloseTo(66.67, 1);
  });

  it('tracks conflicts', () => {
    expect(service.getStatus().conflicts).toBe(0);
    service.recordConflict();
    expect(service.getStatus().conflicts).toBe(1);
    service.recordConflictResolution();
    expect(service.getStatus().conflicts).toBe(0);
  });
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    service = new LocalStorageService();
    service.clearAll();
  });

  it('saves and retrieves entity', () => {
    const entity: any = {
      id: '1',
      entityType: 'user',
      localVersion: 1,
      remoteVersion: 1,
      lastSyncTime: Date.now(),
      data: { name: 'Alice' },
      hash: 'abc123',
    };

    service.saveEntity(entity);
    const retrieved = service.getEntity('1');

    expect(retrieved).toEqual(entity);
  });

  it('gets all entities', () => {
    const entity1: any = {
      id: '1',
      entityType: 'user',
      data: { name: 'Alice' },
    };
    const entity2: any = {
      id: '2',
      entityType: 'user',
      data: { name: 'Bob' },
    };

    service.saveEntity(entity1);
    service.saveEntity(entity2);

    const all = service.getAllEntities();
    expect(all.length).toBe(2);
  });

  it('checks entity existence', () => {
    const entity: any = { id: '1', data: {} };
    service.saveEntity(entity);

    expect(service.hasEntity('1')).toBe(true);
    expect(service.hasEntity('2')).toBe(false);
  });

  it('gets storage statistics', () => {
    const entity: any = {
      id: '1',
      data: { name: 'Alice' },
      timestamp: Date.now(),
    };

    service.saveEntity(entity);
    const stats = service.getStatistics();

    expect(stats.entityCount).toBeGreaterThan(0);
    expect(stats.storageSize).toBeGreaterThan(0);
  });
});

describe('RetryService', () => {
  let service: RetryService;

  beforeEach(() => {
    service = new RetryService();
  });

  it('retries on failure', async () => {
    let attempts = 0;

    const result = await service.executeWithRetry(() => {
      attempts++;
      if (attempts < 2) {
        return Promise.reject(new Error('Failed'));
      }
      return Promise.resolve('Success');
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe('Success');
    expect(result.attempts).toBe(2);
  });

  it('fails after max attempts', async () => {
    const result = await service.executeWithRetry(
      () => Promise.reject(new Error('Always fails')),
      { maxAttempts: 2 }
    );

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(2);
    expect(result.error).toBeDefined();
  });

  it('calculates exponential backoff', () => {
    const delay1 = service.getExponentialBackoffDelay(1);
    const delay2 = service.getExponentialBackoffDelay(2);
    const delay3 = service.getExponentialBackoffDelay(3);

    expect(delay2).toBeGreaterThan(delay1);
    expect(delay3).toBeGreaterThan(delay2);
  });
});
