import { BatchRequest } from '@/types/batch';

export class BatchTransactionMonitor {
  private static eventEmitter: Map<string, Array<(data: any) => void>> = new Map();

  static subscribe(event: string, handler: (data: any) => void): () => void {
    if (!this.eventEmitter.has(event)) {
      this.eventEmitter.set(event, []);
    }
    this.eventEmitter.get(event)?.push(handler);

    return () => {
      const handlers = this.eventEmitter.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  static emit(event: string, data: any): void {
    const handlers = this.eventEmitter.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  static monitorBatch(batch: BatchRequest): void {
    this.emit('batch:created', { id: batch.id, txCount: batch.transactions.length });
  }

  static notifyCompletion(batch: BatchRequest, result: any): void {
    this.emit('batch:completed', { id: batch.id, result });
  }

  static notifyError(batch: BatchRequest, error: Error): void {
    this.emit('batch:error', { id: batch.id, error: error.message });
  }
}

export class BatchMetricsCollector {
  private static metrics: Map<string, number> = new Map();

  static record(metric: string, value: number): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  static increment(metric: string): void {
    this.record(metric, 1);
  }

  static getMetric(metric: string): number {
    return this.metrics.get(metric) || 0;
  }

  static getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}
