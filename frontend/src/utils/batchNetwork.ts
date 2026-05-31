import { BatchRequest } from '@/types/batch';

export class BatchNetworkOptimizer {
  static calculateNetworkLoad(): {
    currentLoad: number;
    recommendation: 'submit' | 'wait' | 'cancel';
  } {
    const load = Math.random() * 100;

    if (load < 30) {
      return { currentLoad: load, recommendation: 'submit' };
    } else if (load < 70) {
      return { currentLoad: load, recommendation: 'wait' };
    } else {
      return { currentLoad: load, recommendation: 'cancel' };
    }
  }

  static optimizeForNetwork(batch: BatchRequest): BatchRequest {
    return batch;
  }

  static getNetworkStats(): {
    throughput: number;
    latency: number;
    reliability: number;
  } {
    return {
      throughput: Math.random() * 100,
      latency: Math.random() * 500,
      reliability: Math.random() * 100,
    };
  }
}

export class BatchCompressionStrategy {
  static canCompress(batch: BatchRequest): boolean {
    const serialized = JSON.stringify(batch);
    return serialized.length > 1000;
  }

  static compress(batch: BatchRequest): string {
    const serialized = JSON.stringify(batch);
    return btoa(serialized);
  }

  static decompress(compressed: string): BatchRequest {
    const serialized = atob(compressed);
    return JSON.parse(serialized);
  }

  static getCompressionRatio(original: string, compressed: string): number {
    return (compressed.length / original.length) * 100;
  }
}

export class BatchResourceManager {
  private static resources: Map<string, number> = new Map();
  private static limits: Map<string, number> = new Map();

  static initializeResource(name: string, limit: number): void {
    this.resources.set(name, 0);
    this.limits.set(name, limit);
  }

  static allocateResource(name: string, amount: number): boolean {
    const current = this.resources.get(name) || 0;
    const limit = this.limits.get(name) || Infinity;

    if (current + amount <= limit) {
      this.resources.set(name, current + amount);
      return true;
    }

    return false;
  }

  static releaseResource(name: string, amount: number): void {
    const current = this.resources.get(name) || 0;
    this.resources.set(name, Math.max(0, current - amount));
  }

  static getResourceUsage(name: string): { used: number; limit: number; percentage: number } {
    const used = this.resources.get(name) || 0;
    const limit = this.limits.get(name) || Infinity;
    const percentage = limit === Infinity ? 0 : (used / limit) * 100;

    return { used, limit, percentage };
  }

  static reset(): void {
    this.resources.clear();
    this.limits.clear();
  }
}

export class BatchCapacityMonitor {
  private static metrics: Array<{
    timestamp: number;
    capacity: number;
    utilization: number;
  }> = [];

  static recordCapacity(capacity: number, utilization: number): void {
    this.metrics.push({
      timestamp: Date.now(),
      capacity,
      utilization,
    });
  }

  static getCapacityTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.metrics.length < 2) return 'stable';

    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, m) => sum + m.utilization, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.utilization, 0) / older.length;

    if (recentAvg > olderAvg) return 'increasing';
    if (recentAvg < olderAvg) return 'decreasing';
    return 'stable';
  }

  static getCapacityForecast(): {
    forecastedCapacity: number;
    confidence: number;
  } {
    if (this.metrics.length === 0) {
      return { forecastedCapacity: 100, confidence: 0 };
    }

    const recent = this.metrics.slice(-5);
    const avgCapacity = recent.reduce((sum, m) => sum + m.capacity, 0) / recent.length;
    const confidence = Math.min((this.metrics.length / 100) * 100, 95);

    return {
      forecastedCapacity: Math.round(avgCapacity),
      confidence: Math.round(confidence),
    };
  }

  static clear(): void {
    this.metrics = [];
  }
}
