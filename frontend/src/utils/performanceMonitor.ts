/**
 * Utility for monitoring application performance and Web Vitals.
 */
export class PerformanceMonitor {
    /**
     * Records a custom timing metric.
     */
    static recordTiming(name: string, value: number, tags: Record<string, string> = {}): void {
        console.log(`[PERF] ${name}: ${value}ms`, tags);
        // In production, this would send data to an analytics endpoint
    }

    /**
     * Measures the execution time of a function.
     */
    static async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = performance.now();
        try {
            return await fn();
        } finally {
            const duration = performance.now() - start;
            this.recordTiming(name, duration);
        }
    }

    /**
     * Helper to track Web Vitals (LCP, FID, CLS).
     * Note: This is an architectural placeholder for actual web-vitals integration.
     */
    static trackWebVitals(): void {
        if ('PaintTiming' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordTiming(entry.name, entry.startTime);
                });
            });
            observer.observe({ type: 'paint', buffered: true });
        }
    }
}
