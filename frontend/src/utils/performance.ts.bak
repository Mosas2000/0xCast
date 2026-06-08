/**
 * Performance monitoring and optimization for sync system
 */

export type MetricTags = Record<string, string | number | boolean>;

export interface OperationStatistics {
  count: number;
  min: number;
  max: number;
  avg: number;
  p95: number;
  p99: number;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  tags?: MetricTags;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private maxMetricsPerName: number = 100;

  startMeasure(name: string): () => number {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      return duration;
    };
  }

  recordMetric(name: string, duration: number, tags?: MetricTags): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const list = this.metrics.get(name)!;
    list.push(metric);

    if (list.length > this.maxMetricsPerName) {
      list.shift();
    }
  }

  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  getStatistics(name: string): OperationStatistics {
    const metrics = this.getMetrics(name);

    if (metrics.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p95: 0, p99: 0 };
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);

    const count = durations.length;
    const min = durations[0];
    const max = durations[count - 1];
    const avg = durations.reduce((a, b) => a + b, 0) / count;
    const p95 = durations[Math.floor(count * 0.95)];
    const p99 = durations[Math.floor(count * 0.99)];

    return { count, min, max, avg, p95, p99 };
  }

  getAllStatistics(): Record<string, OperationStatistics> {
    const stats: Record<string, OperationStatistics> = {};

    for (const [name] of this.metrics) {
      stats[name] = this.getStatistics(name);
    }

    return stats;
  }

  reset(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      statistics: this.getAllStatistics(),
      recentMetrics: Array.from(this.metrics.entries()).reduce(
        (acc, [name, metrics]) => {
          acc[name] = metrics.slice(-10); // Last 10
          return acc;
        },
        {} as Record<string, PerformanceMetric[]>
      ),
    };

    return JSON.stringify(data, null, 2);
  }
}

/**
 * Bottleneck detector
 */
export class BottleneckDetector {
  constructor(private monitor: PerformanceMonitor) {}

  detectBottlenecks(threshold: number = 1000): Array<{
    operation: string;
    avgTime: number;
    isBottleneck: boolean;
  }> {
    const stats = this.monitor.getAllStatistics();
    const bottlenecks: Array<{
      operation: string;
      avgTime: number;
      isBottleneck: boolean;
    }> = [];

    for (const [operation, stat] of Object.entries(stats)) {
      const isBottleneck = stat.avg > threshold;
      bottlenecks.push({
        operation,
        avgTime: stat.avg,
        isBottleneck,
      });
    }

    return bottlenecks.sort((a, b) => b.avgTime - a.avgTime);
  }

  getSlowOperations(percentile: number = 95): Array<{
    operation: string;
    p95: number;
  }> {
    const stats = this.monitor.getAllStatistics();

    return Object.entries(stats)
      .map(([operation, stat]) => ({
        operation,
        pValue: stat.p95,
      }))
      .filter((item) => item.pValue > 0)
      .sort((a, b) => b.pValue - a.pValue);
  }

  suggestOptimizations(): string[] {
    const suggestions: string[] = [];
    const bottlenecks = this.detectBottlenecks();

    bottlenecks.forEach((bn) => {
      if (bn.isBottleneck) {
        if (bn.operation.includes('sync')) {
          suggestions.push(
            `Optimize ${bn.operation}: Reduce batch size or increase sync interval`
          );
        } else if (bn.operation.includes('conflict')) {
          suggestions.push(
            `Optimize ${bn.operation}: Implement faster diff algorithm`
          );
        } else if (bn.operation.includes('storage')) {
          suggestions.push(
            `Optimize ${bn.operation}: Consider IndexedDB instead of localStorage`
          );
        }
      }
    });

    return suggestions;
  }
}

/**
 * Memory profiler
 */
export class MemoryProfiler {
  private snapshots: Array<{
    timestamp: number;
    heap: number;
    entities: number;
    actions: number;
  }> = [];

  private maxSnapshots: number = 60; // ~1 hour with 1-min intervals

  takeSnapshot(entityCount: number, actionCount: number): void {
    const heapSize = performance.memory?.usedJSHeapSize || 0;

    this.snapshots.push({
      timestamp: Date.now(),
      heap: heapSize,
      entities: entityCount,
      actions: actionCount,
    });

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  getMemoryTrend(): {
    heapGrowth: number;
    entitiesGrowth: number;
    heapPerEntity: number;
  } {
    if (this.snapshots.length < 2) {
      return { heapGrowth: 0, entitiesGrowth: 0, heapPerEntity: 0 };
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];

    const heapGrowth = last.heap - first.heap;
    const entitiesGrowth = last.entities - first.entities;
    const heapPerEntity =
      entitiesGrowth > 0 ? heapGrowth / entitiesGrowth : 0;

    return { heapGrowth, entitiesGrowth, heapPerEntity };
  }

  detectMemoryLeaks(): { hasLeaks: boolean; evidence: string[] } {
    const trend = this.getMemoryTrend();
    const evidence: string[] = [];

    // Check if heap grows faster than entities
    if (
      trend.heapPerEntity > 1048576 &&
      trend.entitiesGrowth < trend.heapGrowth / 1048576
    ) {
      evidence.push('Heap growth not proportional to entity count');
    }

    // Check for continuous heap growth
    if (this.snapshots.length > 30) {
      const recent = this.snapshots.slice(-10);
      let ascending = 0;

      for (let i = 1; i < recent.length; i++) {
        if (recent[i].heap > recent[i - 1].heap) {
          ascending++;
        }
      }

      if (ascending >= 8) {
        evidence.push('Continuous memory growth detected');
      }
    }

    return {
      hasLeaks: evidence.length > 0,
      evidence,
    };
  }

  getReport(): string {
    const trend = this.getMemoryTrend();
    const leaks = this.detectMemoryLeaks();

    const report = `
Memory Profile Report
=====================
Snapshots: ${this.snapshots.length}
Heap Growth: ${(trend.heapGrowth / 1024 / 1024).toFixed(2)} MB
Entities Growth: ${trend.entitiesGrowth}
Heap per Entity: ${(trend.heapPerEntity / 1024).toFixed(2)} KB

Memory Leaks Detected: ${leaks.hasLeaks ? 'YES' : 'NO'}
${leaks.evidence.map((e) => `  - ${e}`).join('\n')}

Recent Snapshots:
${this.snapshots
  .slice(-5)
  .map(
    (s) =>
      `  ${new Date(s.timestamp).toLocaleTimeString()}: ${(s.heap / 1024 / 1024).toFixed(2)}MB, ${s.entities} entities, ${s.actions} actions`
  )
  .join('\n')}
`;

    return report;
  }
}

/**
 * Network profiler
 */
export class NetworkProfiler {
  private requests: Array<{
    timestamp: number;
    duration: number;
    size: number;
    status: number;
    type: string;
  }> = [];

  private maxRequests: number = 1000;

  recordRequest(
    duration: number,
    size: number,
    status: number,
    type: string
  ): void {
    this.requests.push({
      timestamp: Date.now(),
      duration,
      size,
      status,
      type,
    });

    if (this.requests.length > this.maxRequests) {
      this.requests.shift();
    }
  }

  getStatistics(): {
    totalRequests: number;
    avgDuration: number;
    avgSize: number;
    totalData: number;
    errorRate: number;
    throughput: number; // bytes/sec
  } {
    if (this.requests.length === 0) {
      return {
        totalRequests: 0,
        avgDuration: 0,
        avgSize: 0,
        totalData: 0,
        errorRate: 0,
        throughput: 0,
      };
    }

    const totalRequests = this.requests.length;
    const totalDuration = this.requests.reduce((sum, r) => sum + r.duration, 0);
    const totalSize = this.requests.reduce((sum, r) => sum + r.size, 0);
    const errors = this.requests.filter((r) => r.status >= 400).length;

    const avgDuration = totalDuration / totalRequests;
    const avgSize = totalSize / totalRequests;
    const errorRate = errors / totalRequests;
    const throughput = totalSize / (totalDuration / 1000); // bytes/sec

    return {
      totalRequests,
      avgDuration,
      avgSize,
      totalData: totalSize,
      errorRate,
      throughput,
    };
  }

  getSlowRequests(threshold: number = 1000): Array<{
    timestamp: number;
    duration: number;
    type: string;
  }> {
    return this.requests
      .filter((r) => r.duration > threshold)
      .map((r) => ({
        timestamp: r.timestamp,
        duration: r.duration,
        type: r.type,
      }))
      .sort((a, b) => b.duration - a.duration);
  }

  reset(): void {
    this.requests = [];
  }
}

/**
 * Comprehensive performance dashboard
 */
export class PerformanceDashboard {
  constructor(
    private monitor: PerformanceMonitor,
    private detector: BottleneckDetector,
    private memory: MemoryProfiler,
    private network: NetworkProfiler
  ) {}

  generateReport(): string {
    const bottlenecks = this.detector.detectBottlenecks();
    const slowOps = this.detector.getSlowOperations();
    const suggestions = this.detector.suggestOptimizations();
    const networkStats = this.network.getStatistics();
    const memoryReport = this.memory.getReport();
    const allStats = this.monitor.getAllStatistics();

    const report = `
╔════════════════════════════════════════════════════════════════════════════╗
║                      SYNC SYSTEM PERFORMANCE DASHBOARD                     ║
╚════════════════════════════════════════════════════════════════════════════╝

OPERATION STATISTICS
${Object.entries(allStats)
  .map(
    ([name, stat]) =>
      `  ${name.padEnd(30)} avg: ${stat.avg.toFixed(2)}ms  p95: ${stat.p95.toFixed(2)}ms  p99: ${stat.p99.toFixed(2)}ms`
  )
  .join('\n')}

BOTTLENECKS DETECTED
${bottlenecks
  .filter((bn) => bn.isBottleneck)
  .map((bn) => `  ❌ ${bn.operation}: ${bn.avgTime.toFixed(2)}ms`)
  .join('\n') || '  ✓ No bottlenecks detected'}

SLOW OPERATIONS (p95)
${slowOps
  .slice(0, 5)
  .map((op) => `  ${op.operation}: ${op.pValue.toFixed(2)}ms`)
  .join('\n')}

OPTIMIZATION SUGGESTIONS
${suggestions.map((s) => `  • ${s}`).join('\n') || '  ✓ System optimized'}

NETWORK PERFORMANCE
  Total Requests: ${networkStats.totalRequests}
  Avg Duration: ${networkStats.avgDuration.toFixed(2)}ms
  Avg Size: ${(networkStats.avgSize / 1024).toFixed(2)}KB
  Total Data: ${(networkStats.totalData / 1024 / 1024).toFixed(2)}MB
  Error Rate: ${(networkStats.errorRate * 100).toFixed(2)}%
  Throughput: ${(networkStats.throughput / 1024 / 1024).toFixed(2)}MB/s

${memoryReport}

═════════════════════════════════════════════════════════════════════════════
`;

    return report;
  }
}
