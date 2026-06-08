interface QueuedNotification {
  id: string;
  notification: any;
  channel: string;
  retries: number;
  maxRetries: number;
  nextRetryTime: number;
  createdAt: number;
}

export class NotificationQueue {
  private queue: Map<string, QueuedNotification> = new Map();
  private maxRetries: number = 3;
  private retryDelayMs: number = 1000;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(maxRetries: number = 3, retryDelayMs: number = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
  }

  enqueue(id: string, notification: any, channel: string): void {
    const queuedNotif: QueuedNotification = {
      id,
      notification,
      channel,
      retries: 0,
      maxRetries: this.maxRetries,
      nextRetryTime: Date.now(),
      createdAt: Date.now(),
    };

    this.queue.set(id, queuedNotif);
  }

  dequeue(id: string): QueuedNotification | undefined {
    return this.queue.get(id);
  }

  remove(id: string): boolean {
    return this.queue.delete(id);
  }

  retry(id: string): boolean {
    const item = this.queue.get(id);
    if (!item) return false;

    if (item.retries < item.maxRetries) {
      item.retries++;
      item.nextRetryTime = Date.now() + this.retryDelayMs * Math.pow(2, item.retries - 1);
      return true;
    }

    this.queue.delete(id);
    return false;
  }

  getReadyItems(): QueuedNotification[] {
    const now = Date.now();
    const ready: QueuedNotification[] = [];

    for (const item of this.queue.values()) {
      if (item.nextRetryTime <= now) {
        ready.push(item);
      }
    }

    return ready;
  }

  getSize(): number {
    return this.queue.size;
  }

  clear(): void {
    this.queue.clear();
  }

  getStats(): {
    total: number;
    byChannel: Record<string, number>;
    byRetries: Record<number, number>;
  } {
    const stats = {
      total: this.queue.size,
      byChannel: {} as Record<string, number>,
      byRetries: {} as Record<number, number>,
    };

    for (const item of this.queue.values()) {
      stats.byChannel[item.channel] = (stats.byChannel[item.channel] || 0) + 1;
      stats.byRetries[item.retries] = (stats.byRetries[item.retries] || 0) + 1;
    }

    return stats;
  }

  startProcessing(processor: (item: QueuedNotification) => Promise<boolean>, intervalMs: number = 5000): void {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(async () => {
      const readyItems = this.getReadyItems();

      for (const item of readyItems) {
        try {
          const success = await processor(item);

          if (success) {
            this.remove(item.id);
          } else {
            this.retry(item.id);
          }
        } catch (error) {
          this.retry(item.id);
        }
      }
    }, intervalMs);
  }

  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  getPendingItems(): QueuedNotification[] {
    return Array.from(this.queue.values());
  }

  getFailedItems(): QueuedNotification[] {
    return Array.from(this.queue.values()).filter((item) => item.retries === item.maxRetries);
  }

  getOldItems(ageMs: number): QueuedNotification[] {
    const now = Date.now();
    return Array.from(this.queue.values()).filter((item) => now - item.createdAt > ageMs);
  }

  removeOldItems(ageMs: number): number {
    const oldItems = this.getOldItems(ageMs);
    let removed = 0;

    for (const item of oldItems) {
      if (this.queue.delete(item.id)) {
        removed++;
      }
    }

    return removed;
  }
}
