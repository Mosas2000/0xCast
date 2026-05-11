import { logger, type LogEntry } from '../utils/logger';
import type { LogData } from '@/types/common';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: LogData;
}

export interface ErrorMetric {
  type: string;
  message: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  context?: LogData;
}

export interface MonitoringConfig {
  enabled?: boolean;
  logErrors?: boolean;
  trackPerformance?: boolean;
  trackUserActions?: boolean;
  trackContractCalls?: boolean;
  maxMetrics?: number;
}

const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  logErrors: true,
  trackPerformance: true,
  trackUserActions: true,
  trackContractCalls: true,
  maxMetrics: 10000,
};

export interface UserAction {
  action: string;
  timestamp: number;
  context?: LogData;
}

class MonitoringService {
  private config: MonitoringConfig;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorMetrics: Map<string, ErrorMetric> = new Map();
  private userActions: UserAction[] = [];

  constructor(config: MonitoringConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private shouldTrack(): boolean {
    return this.config.enabled !== false;
  }

  private addPerformanceMetric(metric: PerformanceMetric): void {
    if (!this.config.trackPerformance) return;

    if (this.config.maxMetrics && this.performanceMetrics.length >= this.config.maxMetrics) {
      this.performanceMetrics.shift();
    }

    this.performanceMetrics.push(metric);
  }

  private addErrorMetric(metric: ErrorMetric): void {
    const key = `${metric.type}:${metric.message}`;

    if (this.errorMetrics.has(key)) {
      const existing = this.errorMetrics.get(key)!;
      existing.count += 1;
      existing.lastSeen = Date.now();
    } else {
      this.errorMetrics.set(key, {
        ...metric,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
      });
    }

    if (this.config.maxMetrics && this.errorMetrics.size >= this.config.maxMetrics) {
      const firstKey = this.errorMetrics.keys().next().value;
      this.errorMetrics.delete(firstKey);
    }
  }

  private addUserAction(action: string, context?: LogData): void {
    if (!this.config.trackUserActions) return;

    this.userActions.push({ action, timestamp: Date.now(), context });

    if (this.config.maxMetrics && this.userActions.length >= this.config.maxMetrics) {
      this.userActions.shift();
    }
  }

  trackPerformance(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms',
    context?: LogData
  ): void {
    if (!this.shouldTrack()) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context,
    };

    this.addPerformanceMetric(metric);
  }

  trackError(
    type: string,
    message: string,
    context?: LogData
  ): void {
    if (!this.shouldTrack()) return;

    const metric: ErrorMetric = {
      type,
      message,
      count: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      context,
    };

    this.addErrorMetric(metric);

    if (this.config.logErrors) {
      logger.error(message, { ...context, errorType: type });
    }
  }

  trackUserAction(
    action: string,
    context?: LogData
  ): void {
    if (!this.shouldTrack()) return;

    this.addUserAction(action, context);
    logger.info(`User action: ${action}`, context);
  }

  trackContractCall(
    contract: string,
    functionName: string,
    duration: number,
    success: boolean,
    context?: LogData
  ): void {
    if (!this.shouldTrack()) return;

    if (!this.config.trackContractCalls) return;

    this.trackPerformance(
      `contract_${contract}_${functionName}`,
      duration,
      'ms',
      { ...context, contract, functionName, success }
    );

    if (!success) {
      this.trackError(
        'contract_call_failed',
        `Contract call failed: ${contract}.${functionName}`,
        { ...context, contract, functionName }
      );
    }
  }

  trackPageView(page: string, context?: LogData): void {
    if (!this.shouldTrack()) return;

    this.trackUserAction('page_view', { page, ...context });
  }

  trackButtonClick(
    button: string,
    context?: LogData
  ): void {
    if (!this.shouldTrack()) return;

    this.trackUserAction('button_click', { button, ...context });
  }

  trackTransaction(
    type: string,
    status: string,
    duration: number,
    context?: LogData
  ): void {
    if (!this.shouldTrack()) return;

    this.trackPerformance(`transaction_${type}`, duration, 'ms', {
      ...context,
      status,
    });

    if (status === 'failed') {
      this.trackError('transaction_failed', `Transaction failed: ${type}`, context);
    }
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  getPerformanceMetricsByName(name: string): PerformanceMetric[] {
    return this.performanceMetrics.filter((m) => m.name === name);
  }

  getPerformanceStats(): {
    total: number;
    byName: Record<string, number>;
    avgByName: Record<string, number>;
  } {
    const byName: Record<string, number> = {};
    const sumByName: Record<string, number> = {};

    this.performanceMetrics.forEach((metric) => {
      byName[metric.name] = (byName[metric.name] || 0) + 1;
      sumByName[metric.name] = (sumByName[metric.name] || 0) + metric.value;
    });

    const avgByName: Record<string, number> = {};

    Object.keys(byName).forEach((name) => {
      avgByName[name] = sumByName[name] / byName[name];
    });

    return {
      total: this.performanceMetrics.length,
      byName,
      avgByName,
    };
  }

  getErrorMetrics(): ErrorMetric[] {
    return Array.from(this.errorMetrics.values());
  }

  getErrorMetricsByType(type: string): ErrorMetric[] {
    return Array.from(this.errorMetrics.values()).filter(
      (m) => m.type === type
    );
  }

  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    byMessage: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byMessage: Record<string, number> = {};

    this.errorMetrics.forEach((metric) => {
      byType[metric.type] = (byType[metric.type] || 0) + metric.count;
      byMessage[metric.message] = (byMessage[metric.message] || 0) + metric.count;
    });

    return {
      total: this.errorMetrics.size,
      byType,
      byMessage,
    };
  }

  getUserActions(): UserAction[] {
    return [...this.userActions];
  }

  getUserActionsByType(action: string): UserAction[] {
    return this.userActions.filter((a) => a.action === action);
  }

  getRecentUserActions(count: number = 10): UserAction[] {
    return this.userActions.slice(-count);
  }

  clearAllMetrics(): void {
    this.performanceMetrics = [];
    this.errorMetrics.clear();
    this.userActions = [];
  }

  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }

  clearErrorMetrics(): void {
    this.errorMetrics.clear();
  }

  clearUserActions(): void {
    this.userActions = [];
  }
}

export const monitoringService = new MonitoringService();
