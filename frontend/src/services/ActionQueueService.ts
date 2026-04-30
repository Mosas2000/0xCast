import { QueuedAction, SyncAction } from '@/types/sync';

export class ActionQueueService {
  private queue: Map<string, QueuedAction> = new Map();
  private processingQueue: Set<string> = new Set();
  private listeners: Map<string, Function[]> = new Map();

  addAction(
    entityId: string,
    entityType: string,
    action: SyncAction,
    payload: Record<string, any>,
    maxRetries: number = 3
  ): QueuedAction {
    const id = this.generateId();
    const queuedAction: QueuedAction = {
      id,
      entityId,
      entityType,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    this.queue.set(id, queuedAction);
    this.emit('action_queued', queuedAction);

    return queuedAction;
  }

  getAction(id: string): QueuedAction | undefined {
    return this.queue.get(id);
  }

  getNextAction(): QueuedAction | undefined {
    for (const [id, action] of this.queue) {
      if (!this.processingQueue.has(id) && !this.shouldRetryLater(action)) {
        return action;
      }
    }
    return undefined;
  }

  getActionsByEntity(entityId: string, entityType: string): QueuedAction[] {
    return Array.from(this.queue.values()).filter(
      action =>
        action.entityId === entityId && action.entityType === entityType
    );
  }

  markProcessing(id: string): void {
    this.processingQueue.add(id);
    this.emit('processing', id);
  }

  markComplete(id: string): void {
    this.queue.delete(id);
    this.processingQueue.delete(id);
    this.emit('action_complete', id);
  }

  markFailed(id: string, error: string, retryDelay: number = 5000): boolean {
    const action = this.queue.get(id);
    if (!action) return false;

    action.retryCount++;
    action.lastError = error;
    action.lastAttempt = Date.now();

    if (action.retryCount >= action.maxRetries) {
      this.emit('action_failed', { id, error, retryCount: action.retryCount });
      this.queue.delete(id);
      this.processingQueue.delete(id);
      return false;
    }

    this.processingQueue.delete(id);
    setTimeout(() => {
      this.emit('action_retry', { id, retryCount: action.retryCount });
    }, retryDelay);

    return true;
  }

  getPendingActions(): QueuedAction[] {
    return Array.from(this.queue.values()).filter(
      action => !this.processingQueue.has(action.id)
    );
  }

  getPendingCount(): number {
    return this.getPendingActions().length;
  }

  getProcessingCount(): number {
    return this.processingQueue.size;
  }

  clearQueue(): void {
    this.queue.clear();
    this.processingQueue.clear();
    this.emit('queue_cleared');
  }

  clearEntity(entityId: string, entityType: string): void {
    const actionsToRemove: string[] = [];

    this.queue.forEach((action, id) => {
      if (action.entityId === entityId && action.entityType === entityType) {
        actionsToRemove.push(id);
      }
    });

    actionsToRemove.forEach(id => {
      this.queue.delete(id);
      this.processingQueue.delete(id);
    });

    this.emit('entity_cleared', { entityId, entityType });
  }

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: LogData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private shouldRetryLater(action: QueuedAction): boolean {
    if (!action.lastAttempt) return false;

    const retryDelay = Math.pow(2, action.retryCount) * 1000;
    const timeSinceLastAttempt = Date.now() - action.lastAttempt;

    return timeSinceLastAttempt < retryDelay;
  }

  private generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getBatchActions(batchSize: number): QueuedAction[] {
    const pending = this.getPendingActions();
    return pending.slice(0, Math.min(batchSize, pending.length));
  }

  prioritizeAction(id: string): boolean {
    const action = this.queue.get(id);
    if (!action) return false;

    this.queue.delete(id);
    this.queue.set(id, action);

    return true;
  }

  getQueueStats(): {
    total: number;
    pending: number;
    processing: number;
    failed: number;
  } {
    return {
      total: this.queue.size,
      pending: this.getPendingCount(),
      processing: this.getProcessingCount(),
      failed: 0,
    };
  }
}
