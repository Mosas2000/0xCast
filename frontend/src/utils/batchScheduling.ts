import { BatchRequest } from '@/types/batch';

export class BatchScheduler {
  private static schedules: Map<string, NodeJS.Timeout> = new Map();

  static scheduleBatchSubmission(
    batch: BatchRequest,
    delayMs: number,
    callback: (batch: BatchRequest) => void
  ): string {
    const scheduledId = `scheduled_${batch.id}_${Date.now()}`;

    const timeout = setTimeout(() => {
      callback(batch);
      this.schedules.delete(scheduledId);
    }, delayMs);

    this.schedules.set(scheduledId, timeout);
    return scheduledId;
  }

  static cancelScheduledBatch(scheduledId: string): boolean {
    const timeout = this.schedules.get(scheduledId);
    if (timeout) {
      clearTimeout(timeout);
      this.schedules.delete(scheduledId);
      return true;
    }
    return false;
  }

  static reschedule(scheduledId: string, newDelayMs: number): boolean {
    const timeout = this.schedules.get(scheduledId);
    if (!timeout) return false;

    clearTimeout(timeout);
    this.schedules.delete(scheduledId);

    const newTimeout = setTimeout(() => {
      this.schedules.delete(scheduledId);
    }, newDelayMs);

    this.schedules.set(scheduledId, newTimeout);
    return true;
  }

  static getScheduledCount(): number {
    return this.schedules.size;
  }

  static clearAllScheduled(): void {
    for (const timeout of this.schedules.values()) {
      clearTimeout(timeout);
    }
    this.schedules.clear();
  }
}

export class BatchTimingOptimizer {
  static calculateOptimalSubmissionTime(): number {
    const now = Date.now();
    const hour = new Date(now).getHours();

    if (hour >= 2 && hour < 6) {
      return 0;
    }

    if (hour >= 14 && hour < 18) {
      return 3600000;
    }

    if (hour >= 20 && hour < 24) {
      return 1800000;
    }

    return 0;
  }

  static calculateBackoffDelay(retryCount: number): number {
    const baseDelay = 1000;
    const maxDelay = 60000;
    const delay = baseDelay * Math.pow(2, retryCount);
    return Math.min(delay, maxDelay);
  }

  static shouldBatchNow(pendingCount: number, threshold: number): boolean {
    return pendingCount >= threshold;
  }

  static getNetworkPeakHours(): number[] {
    return [12, 13, 18, 19, 20];
  }

  static getNetworkOffPeakHours(): number[] {
    return [2, 3, 4, 5, 6];
  }
}

export class BatchWindowManager {
  private static windows: Map<
    string,
    {
      startTime: number;
      duration: number;
      maxBatches: number;
      processedCount: number;
    }
  > = new Map();

  static createWindow(
    windowId: string,
    durationMs: number,
    maxBatches: number
  ): void {
    this.windows.set(windowId, {
      startTime: Date.now(),
      duration: durationMs,
      maxBatches,
      processedCount: 0,
    });
  }

  static canProcessInWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    const elapsed = Date.now() - window.startTime;
    if (elapsed > window.duration) {
      this.windows.delete(windowId);
      return false;
    }

    return window.processedCount < window.maxBatches;
  }

  static recordProcessing(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    window.processedCount++;
    return true;
  }

  static getWindowStatus(windowId: string): {
    remaining: number;
    timeLeft: number;
    canProcess: boolean;
  } | null {
    const window = this.windows.get(windowId);
    if (!window) return null;

    const elapsed = Date.now() - window.startTime;
    const timeLeft = Math.max(0, window.duration - elapsed);

    return {
      remaining: window.maxBatches - window.processedCount,
      timeLeft,
      canProcess: this.canProcessInWindow(windowId),
    };
  }

  static closeWindow(windowId: string): void {
    this.windows.delete(windowId);
  }
}

export class BatchIntervalManager {
  private static intervals: Map<
    string,
    {
      callback: () => void;
      intervalId: NodeJS.Timer;
      interval: number;
    }
  > = new Map();

  static registerInterval(intervalId: string, callback: () => void, intervalMs: number): void {
    const handle = setInterval(callback, intervalMs);
    this.intervals.set(intervalId, { callback, intervalId: handle, interval: intervalMs });
  }

  static unregisterInterval(intervalId: string): boolean {
    const item = this.intervals.get(intervalId);
    if (item) {
      clearInterval(item.intervalId);
      this.intervals.delete(intervalId);
      return true;
    }
    return false;
  }

  static updateInterval(intervalId: string, newIntervalMs: number): boolean {
    const item = this.intervals.get(intervalId);
    if (!item) return false;

    clearInterval(item.intervalId);

    const newHandle = setInterval(item.callback, newIntervalMs);
    this.intervals.set(intervalId, {
      ...item,
      intervalId: newHandle,
      interval: newIntervalMs,
    });

    return true;
  }

  static getInterval(intervalId: string): number | null {
    const item = this.intervals.get(intervalId);
    return item ? item.interval : null;
  }

  static clearAll(): void {
    for (const item of this.intervals.values()) {
      clearInterval(item.intervalId);
    }
    this.intervals.clear();
  }
}
