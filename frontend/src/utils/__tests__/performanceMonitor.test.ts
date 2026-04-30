import { performanceMonitor } from '../performanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  describe('startMeasure', () => {
    it('records metric with duration', () => {
      const endMeasure = performanceMonitor.startMeasure('test-operation');
      endMeasure(false);
      
      const metrics = performanceMonitor.getMetrics('test-operation');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-operation');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
      expect(metrics[0].cached).toBe(false);
    });

    it('records cached status', () => {
      const endMeasure = performanceMonitor.startMeasure('test-operation');
      endMeasure(true);
      
      const metrics = performanceMonitor.getMetrics('test-operation');
      expect(metrics[0].cached).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('returns all metrics when no name provided', () => {
      performanceMonitor.startMeasure('op1')(false);
      performanceMonitor.startMeasure('op2')(false);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(2);
    });

    it('filters metrics by name', () => {
      performanceMonitor.startMeasure('op1')(false);
      performanceMonitor.startMeasure('op2')(false);
      performanceMonitor.startMeasure('op1')(false);
      
      const metrics = performanceMonitor.getMetrics('op1');
      expect(metrics).toHaveLength(2);
      expect(metrics.every(m => m.name === 'op1')).toBe(true);
    });
  });

  describe('getAverageDuration', () => {
    it('calculates average duration', () => {
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 100,
        timestamp: Date.now(),
        cached: false,
      });
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 200,
        timestamp: Date.now(),
        cached: false,
      });
      
      const avg = performanceMonitor.getAverageDuration('test');
      expect(avg).toBe(150);
    });

    it('returns 0 for non-existent metric', () => {
      const avg = performanceMonitor.getAverageDuration('non-existent');
      expect(avg).toBe(0);
    });
  });

  describe('getCacheHitRate', () => {
    it('calculates cache hit rate', () => {
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 10,
        timestamp: Date.now(),
        cached: true,
      });
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 100,
        timestamp: Date.now(),
        cached: false,
      });
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 10,
        timestamp: Date.now(),
        cached: true,
      });
      
      const hitRate = performanceMonitor.getCacheHitRate('test');
      expect(hitRate).toBeCloseTo(66.67, 1);
    });

    it('returns 0 for non-existent metric', () => {
      const hitRate = performanceMonitor.getCacheHitRate('non-existent');
      expect(hitRate).toBe(0);
    });
  });

  describe('getPerformanceImprovement', () => {
    it('calculates performance improvement', () => {
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 10,
        timestamp: Date.now(),
        cached: true,
      });
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 100,
        timestamp: Date.now(),
        cached: false,
      });
      
      const improvement = performanceMonitor.getPerformanceImprovement('test');
      expect(improvement).toBe(90);
    });

    it('returns 0 when no cached or uncached metrics', () => {
      performanceMonitor.recordMetric({
        name: 'test',
        duration: 100,
        timestamp: Date.now(),
        cached: false,
      });
      
      const improvement = performanceMonitor.getPerformanceImprovement('test');
      expect(improvement).toBe(0);
    });
  });

  describe('getSummary', () => {
    it('returns summary of all metrics', () => {
      performanceMonitor.recordMetric({
        name: 'op1',
        duration: 100,
        timestamp: Date.now(),
        cached: false,
      });
      performanceMonitor.recordMetric({
        name: 'op1',
        duration: 10,
        timestamp: Date.now(),
        cached: true,
      });
      performanceMonitor.recordMetric({
        name: 'op2',
        duration: 50,
        timestamp: Date.now(),
        cached: false,
      });
      
      const summary = performanceMonitor.getSummary();
      
      expect(summary).toHaveProperty('op1');
      expect(summary).toHaveProperty('op2');
      expect(summary.op1.count).toBe(2);
      expect(summary.op2.count).toBe(1);
    });
  });

  describe('clear', () => {
    it('clears all metrics', () => {
      performanceMonitor.startMeasure('test')(false);
      expect(performanceMonitor.getMetrics()).toHaveLength(1);
      
      performanceMonitor.clear();
      expect(performanceMonitor.getMetrics()).toHaveLength(0);
    });
  });
});
