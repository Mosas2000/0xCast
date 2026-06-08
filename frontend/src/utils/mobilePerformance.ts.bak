export const mobilePerformance = {
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  lazyLoad(callback: () => void, delay = 100): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => callback(), { timeout: delay });
    } else {
      setTimeout(callback, delay);
    }
  },

  prefetchImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  prefetchImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.prefetchImage(src)));
  },

  isReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    const connection = (navigator as Navigator & {
      connection?: { effectiveType?: string };
    }).connection;

    if (!connection) return 'fast';

    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    return 'fast';
  },

  shouldReduceData(): boolean {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection;
    return connection?.saveData || false;
  },

  optimizeForLowEnd(): boolean {
    const memory = (performance as Performance & {
      memory?: { jsHeapSizeLimit?: number };
    }).memory;

    if (!memory) return false;

    const heapLimit = memory.jsHeapSizeLimit || 0;
    return heapLimit < 1073741824;
  },

  measurePerformance(name: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  },

  async measureAsync(name: string, callback: () => Promise<void>): Promise<void> {
    const start = performance.now();
    await callback();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  },

  enableHardwareAcceleration(element: HTMLElement): void {
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform';
  },

  disableHardwareAcceleration(element: HTMLElement): void {
    element.style.transform = '';
    element.style.willChange = '';
  },

  optimizeScrolling(element: HTMLElement): void {
    element.style.webkitOverflowScrolling = 'touch';
    element.style.overflowY = 'auto';
  }
};
