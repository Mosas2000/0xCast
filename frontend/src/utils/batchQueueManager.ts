import { BatchQueueItem, BatchRequest, BatchStatus } from '@/types/batch';

export class BatchQueueManager {
  private queue: Map<string, BatchQueueItem> = new Map();
  private processingQueue: string[] = [];
  private maxQueueSize: number = 100;
  private maxRetries: number = 3;
  private retryDelayMs: number = 5000;

  enqueue(batch: BatchRequest, priority: number = 5): string {
    if (this.queue.size >= this.maxQueueSize) {
      throw new Error('Queue is full');
    }

    const queueItem: BatchQueueItem = {
      id: batch.id,
      batch,
      priority,
      retryCount: 0,
    };

    this.queue.set(batch.id, queueItem);
    this.updateProcessingQueue();

    return batch.id;
  }

  dequeue(): BatchQueueItem | null {
    const nextId = this.processingQueue.shift();
    if (!nextId) return null;

    const item = this.queue.get(nextId);
    if (!item) return null;

    return item;
  }

  peek(): BatchQueueItem | null {
    const nextId = this.processingQueue[0];
    if (!nextId) return null;
    return this.queue.get(nextId) || null;
  }

  contains(batchId: string): boolean {
    return this.queue.has(batchId);
  }

  getItem(batchId: string): BatchQueueItem | null {
    return this.queue.get(batchId) || null;
  }

  updateBatchStatus(batchId: string, status: BatchStatus): void {
    const item = this.queue.get(batchId);
    if (!item) return;

    item.batch.status = status;

    if (status === 'confirmed' || status === 'rolled_back') {
      this.remove(batchId);
    }
  }

  retryBatch(batchId: string): boolean {
    const item = this.queue.get(batchId);
    if (!item) return false;

    if (item.retryCount >= this.maxRetries) {
      this.queue.delete(batchId);
      this.processingQueue = this.processingQueue.filter(id => id !== batchId);
      return false;
    }

    item.retryCount++;
    item.batch.status = 'pending';
    item.nextRetryAt = Date.now() + (this.retryDelayMs * item.retryCount);

    this.updateProcessingQueue();
    return true;
  }

  remove(batchId: string): void {
    this.queue.delete(batchId);
    this.processingQueue = this.processingQueue.filter(id => id !== batchId);
  }

  clear(): void {
    this.queue.clear();
    this.processingQueue = [];
  }

  size(): number {
    return this.queue.size;
  }

  isEmpty(): boolean {
    return this.queue.size === 0;
  }

  getQueueSize(): number {
    return this.processingQueue.length;
  }

  getPriority(batchId: string): number {
    const item = this.queue.get(batchId);
    return item ? item.priority : -1;
  }

  setPriority(batchId: string, priority: number): void {
    const item = this.queue.get(batchId);
    if (!item) return;

    item.priority = priority;
    this.updateProcessingQueue();
  }

  private updateProcessingQueue(): void {
    const items = Array.from(this.queue.values());
    const now = Date.now();

    const readyItems = items.filter(item => {
      if (item.nextRetryAt && item.nextRetryAt > now) {
        return false;
      }
      return item.batch.status === 'pending' || item.batch.status === 'queued';
    });

    this.processingQueue = readyItems
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.id);
  }

  getAllBatches(): BatchRequest[] {
    return Array.from(this.queue.values()).map(item => item.batch);
  }

  getPendingBatches(): BatchRequest[] {
    return Array.from(this.queue.values())
      .filter(item => item.batch.status === 'pending' || item.batch.status === 'queued')
      .map(item => item.batch);
  }

  getCompletedBatches(): BatchRequest[] {
    return Array.from(this.queue.values())
      .filter(item => 
        item.batch.status === 'confirmed' || 
        item.batch.status === 'failed' ||
        item.batch.status === 'rolled_back'
      )
      .map(item => item.batch);
  }

  getStats(): {
    totalBatches: number;
    pendingBatches: number;
    completedBatches: number;
    queueSize: number;
  } {
    return {
      totalBatches: this.queue.size,
      pendingBatches: this.getPendingBatches().length,
      completedBatches: this.getCompletedBatches().length,
      queueSize: this.processingQueue.length,
    };
  }

  setMaxQueueSize(size: number): void {
    this.maxQueueSize = size;
  }

  setMaxRetries(retries: number): void {
    this.maxRetries = retries;
  }

  setRetryDelayMs(delay: number): void {
    this.retryDelayMs = delay;
  }
}
