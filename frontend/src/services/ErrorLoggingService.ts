import { ApiError, ErrorCode } from '@/utils/apiErrors';
import { GDPRComplianceService } from './GDPRComplianceService';
import { SecureStorageV2Service } from './SecureStorageV2Service';

interface ErrorLogEntry {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    code: ErrorCode;
    stack?: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    component?: string;
    action?: string;
    additionalData?: Record<string, unknown>;
  };
  handled: boolean;
  retryCount: number;
}

interface ErrorLoggingConfig {
  enabled: boolean;
  maxLogSize: number;
  sampleRate: number;
  environment: 'development' | 'staging' | 'production';
  dsn?: string;
}

class ErrorLoggingService {
  private logs: ErrorLogEntry[] = [];
  private config: ErrorLoggingConfig;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<ErrorLoggingConfig> = {}) {
    this.config = {
      enabled: true,
      maxLogSize: 1000,
      sampleRate: 1.0,
      environment: 'development',
      ...config,
    };

    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers(): void {
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        component: 'global',
        action: 'uncaught_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason)),
        {
          component: 'global',
          action: 'unhandled_promise_rejection',
        }
      );
    });
  }

  logError(
    error: Error | ApiError,
    context: {
      userId?: string;
      component?: string;
      action?: string;
      additionalData?: Record<string, unknown>;
    } = {}
  ): string {
    if (!this.config.enabled) {
      return '';
    }

    if (Math.random() > this.config.sampleRate) {
      return '';
    }

    const id = this.generateId();
    const entry: ErrorLogEntry = {
      id,
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        code: error instanceof ApiError ? error.code : ErrorCode.UNKNOWN_ERROR,
        stack: error.stack,
      },
      context: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        userId: context.userId,
        component: context.component,
        action: context.action,
        additionalData: context.additionalData,
      },
      handled: false,
      retryCount: 0,
    };

    this.logs.push(entry);

    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    this.persistLog(entry);

    if (this.config.environment === 'development') {
      console.error('[ErrorLogger]', {
        id,
        error: entry.error,
        context: entry.context,
      });
    }

    return id;
  }

  markHandled(id: string): void {
    const entry = this.logs.find(e => e.id === id);
    if (entry) {
      entry.handled = true;
    }
  }

  incrementRetry(id: string): void {
    const entry = this.logs.find(e => e.id === id);
    if (entry) {
      entry.retryCount++;
    }
  }

  getLogs(options: {
    limit?: number;
    offset?: number;
    code?: ErrorCode;
    component?: string;
    unhandledOnly?: boolean;
  } = {}): ErrorLogEntry[] {
    let filtered = [...this.logs];

    if (options.code) {
      filtered = filtered.filter(e => e.error.code === options.code);
    }

    if (options.component) {
      filtered = filtered.filter(e => e.context.component === options.component);
    }

    if (options.unhandledOnly) {
      filtered = filtered.filter(e => !e.handled);
    }

    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;

    return filtered.slice(offset, offset + limit);
  }

  getStats(): {
    total: number;
    byCode: Record<string, number>;
    byComponent: Record<string, number>;
    unhandled: number;
    retryRate: number;
  } {
    const byCode: Record<string, number> = {};
    const byComponent: Record<string, number> = {};
    let unhandled = 0;
    let totalRetries = 0;

    this.logs.forEach(entry => {
      byCode[entry.error.code] = (byCode[entry.error.code] || 0) + 1;
      
      if (entry.context.component) {
        byComponent[entry.context.component] = 
          (byComponent[entry.context.component] || 0) + 1;
      }

      if (!entry.handled) {
        unhandled++;
      }

      totalRetries += entry.retryCount;
    });

    return {
      total: this.logs.length,
      byCode,
      byComponent,
      unhandled,
      retryRate: this.logs.length > 0 ? totalRetries / this.logs.length : 0,
    };
  }

  clearLogs(): void {
    this.logs = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('error_logs');
    }
    SecureStorageV2Service.removeItem('error_logs').catch(error => {
      console.error('Failed to clear error logs from secure storage:', error);
    });
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private persistLog(entry: ErrorLogEntry): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('error_logs');
      const logs = stored ? JSON.parse(stored) : [];
      logs.push(entry);

      const trimmed = logs.slice(-this.config.maxLogSize);

      if (GDPRComplianceService.isAnalyticsEnabled()) {
        localStorage.setItem('error_logs', JSON.stringify(trimmed));

        SecureStorageV2Service.setItem('error_logs', trimmed, {
          encrypt: true,
          category: 'analytics',
          expiresIn: 30 * 24 * 60 * 60 * 1000,
        }).catch(error => {
          console.error('Failed to persist error log to secure storage:', error);
        });
      }
    } catch {
      // Storage full or unavailable, ignore
    }
  }

  async flushToServer(): Promise<void> {
    if (!this.config.dsn || this.logs.length === 0) {
      return;
    }

    const unhandledLogs = this.logs.filter(l => !l.handled);
    if (unhandledLogs.length === 0) {
      return;
    }

    try {
      const response = await fetch(this.config.dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environment: this.config.environment,
          logs: unhandledLogs,
        }),
      });

      if (response.ok) {
        unhandledLogs.forEach(l => this.markHandled(l.id));
      }
    } catch {
      // Failed to flush, will retry later
    }
  }

  startFlushInterval(intervalMs: number = 60000): void {
    this.stopFlushInterval();
    this.flushInterval = setInterval(() => this.flushToServer(), intervalMs);
  }

  stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

export const errorLoggingService = new ErrorLoggingService({
  enabled: true,
  environment: (import.meta.env?.MODE as 'development' | 'staging' | 'production') || 'development',
});

export { ErrorLoggingService };
