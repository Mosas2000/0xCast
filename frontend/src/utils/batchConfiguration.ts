export interface BatchConfiguration {
  maxBatchSize: number;
  minBatchSize: number;
  batchBaseOverhead: number;
  gasPerTransaction: number;
  maxQueueSize: number;
  maxRetries: number;
  retryDelayMs: number;
  timeoutBlocks: number;
  enableAutoSubmit: boolean;
  autoSubmitThreshold: number;
  enableRollback: boolean;
  enablePerformanceTracking: boolean;
}

export class BatchConfigurationManager {
  private static defaultConfig: BatchConfiguration = {
    maxBatchSize: 50,
    minBatchSize: 1,
    batchBaseOverhead: 500,
    gasPerTransaction: 30,
    maxQueueSize: 100,
    maxRetries: 3,
    retryDelayMs: 5000,
    timeoutBlocks: 144,
    enableAutoSubmit: true,
    autoSubmitThreshold: 10,
    enableRollback: true,
    enablePerformanceTracking: true,
  };

  private static config: BatchConfiguration = { ...BatchConfigurationManager.defaultConfig };
  private static localStorageKey: string = 'batch_configuration';

  static getConfig(): BatchConfiguration {
    return { ...this.config };
  }

  static setConfig(config: Partial<BatchConfiguration>): void {
    this.config = { ...this.config, ...config };
    this.persistToStorage();
  }

  static resetToDefaults(): void {
    this.config = { ...BatchConfigurationManager.defaultConfig };
    this.clearStorage();
  }

  static setMaxBatchSize(size: number): void {
    this.config.maxBatchSize = Math.max(this.config.minBatchSize, size);
    this.persistToStorage();
  }

  static setMinBatchSize(size: number): void {
    this.config.minBatchSize = Math.min(this.config.maxBatchSize, size);
    this.persistToStorage();
  }

  static setMaxQueueSize(size: number): void {
    this.config.maxQueueSize = Math.max(1, size);
    this.persistToStorage();
  }

  static setMaxRetries(retries: number): void {
    this.config.maxRetries = Math.max(0, retries);
    this.persistToStorage();
  }

  static setRetryDelayMs(delay: number): void {
    this.config.retryDelayMs = Math.max(1000, delay);
    this.persistToStorage();
  }

  static setAutoSubmit(enabled: boolean, threshold?: number): void {
    this.config.enableAutoSubmit = enabled;
    if (threshold !== undefined) {
      this.config.autoSubmitThreshold = threshold;
    }
    this.persistToStorage();
  }

  static setRollbackEnabled(enabled: boolean): void {
    this.config.enableRollback = enabled;
    this.persistToStorage();
  }

  static setPerformanceTrackingEnabled(enabled: boolean): void {
    this.config.enablePerformanceTracking = enabled;
    this.persistToStorage();
  }

  static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        const loaded = JSON.parse(stored);
        this.config = { ...this.config, ...loaded };
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  private static persistToStorage(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to persist configuration:', error);
    }
  }

  private static clearStorage(): void {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Failed to clear configuration storage:', error);
    }
  }

  static exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  static importConfig(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      this.setConfig(imported);
      return true;
    } catch {
      return false;
    }
  }

  static validateConfig(config: Partial<BatchConfiguration>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.maxBatchSize !== undefined && config.maxBatchSize < 1) {
      errors.push('maxBatchSize must be at least 1');
    }

    if (config.minBatchSize !== undefined && config.minBatchSize < 1) {
      errors.push('minBatchSize must be at least 1');
    }

    if (
      config.maxBatchSize !== undefined &&
      config.minBatchSize !== undefined &&
      config.maxBatchSize < config.minBatchSize
    ) {
      errors.push('maxBatchSize cannot be less than minBatchSize');
    }

    if (config.maxQueueSize !== undefined && config.maxQueueSize < 1) {
      errors.push('maxQueueSize must be at least 1');
    }

    if (config.maxRetries !== undefined && config.maxRetries < 0) {
      errors.push('maxRetries cannot be negative');
    }

    if (config.retryDelayMs !== undefined && config.retryDelayMs < 0) {
      errors.push('retryDelayMs cannot be negative');
    }

    return { valid: errors.length === 0, errors };
  }

  static getConfigSummary(): string {
    return `
Batch Configuration:
  Max Batch Size: ${this.config.maxBatchSize}
  Min Batch Size: ${this.config.minBatchSize}
  Max Queue Size: ${this.config.maxQueueSize}
  Max Retries: ${this.config.maxRetries}
  Retry Delay: ${this.config.retryDelayMs}ms
  Auto Submit: ${this.config.enableAutoSubmit} (threshold: ${this.config.autoSubmitThreshold})
  Rollback: ${this.config.enableRollback}
  Performance Tracking: ${this.config.enablePerformanceTracking}
    `.trim();
  }
}

export class OptimizationSettingsManager {
  private static optimizationEnabled: boolean = true;
  private static targetSavingsPercentage: number = 40;
  private static prioritizeSpeed: boolean = false;
  private static prioritizeCost: boolean = true;

  static isOptimizationEnabled(): boolean {
    return this.optimizationEnabled;
  }

  static setOptimizationEnabled(enabled: boolean): void {
    this.optimizationEnabled = enabled;
  }

  static getTargetSavingsPercentage(): number {
    return this.targetSavingsPercentage;
  }

  static setTargetSavingsPercentage(percentage: number): void {
    this.targetSavingsPercentage = Math.min(100, Math.max(0, percentage));
  }

  static isPrioritizingSpeed(): boolean {
    return this.prioritizeSpeed;
  }

  static setPrioritizeSpeed(prioritize: boolean): void {
    this.prioritizeSpeed = prioritize;
    if (prioritize) {
      this.prioritizeCost = false;
    }
  }

  static isPrioritizingCost(): boolean {
    return this.prioritizeCost;
  }

  static setPrioritizeCost(prioritize: boolean): void {
    this.prioritizeCost = prioritize;
    if (prioritize) {
      this.prioritizeSpeed = false;
    }
  }

  static getOptimizationStrategy(): 'balanced' | 'speed' | 'cost' {
    if (this.prioritizeSpeed) return 'speed';
    if (this.prioritizeCost) return 'cost';
    return 'balanced';
  }
}
