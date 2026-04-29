interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  cached: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;

  startMeasure(name: string): () => void {
    const startTime = performance.now();
    
    return (cached: boolean = false) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        cached,
      });
    };
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageDuration(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  getCacheHitRate(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    
    const cached = filtered.filter(m => m.cached).length;
    return (cached / filtered.length) * 100;
  }

  getPerformanceImprovement(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    const cached = filtered.filter(m => m.cached);
    const uncached = filtered.filter(m => !m.cached);
    
    if (cached.length === 0 || uncached.length === 0) return 0;
    
    const cachedAvg = cached.reduce((sum, m) => sum + m.duration, 0) / cached.length;
    const uncachedAvg = uncached.reduce((sum, m) => sum + m.duration, 0) / uncached.length;
    
    return ((uncachedAvg - cachedAvg) / uncachedAvg) * 100;
  }

  clear(): void {
    this.metrics = [];
  }

  getSummary(): Record<string, any> {
    const names = [...new Set(this.metrics.map(m => m.name))];
    
    return names.reduce((acc, name) => {
      acc[name] = {
        count: this.metrics.filter(m => m.name === name).length,
        averageDuration: this.getAverageDuration(name),
        cacheHitRate: this.getCacheHitRate(name),
        improvement: this.getPerformanceImprovement(name),
      };
      return acc;
    }, {} as Record<string, any>);
  }
}

export const performanceMonitor = new PerformanceMonitor();
