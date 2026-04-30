export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  transactionId?: string;
  component?: string;
  action?: string;
  stack?: string;
}

export interface LoggerConfig {
  level?: LogLevel;
  includeTimestamp?: boolean;
  includeRequestId?: boolean;
  includeUserId?: boolean;
  includeComponent?: boolean;
  includeAction?: boolean;
  includeStack?: boolean;
  maxEntries?: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  includeTimestamp: true,
  includeRequestId: true,
  includeUserId: true,
  includeComponent: true,
  includeAction: true,
  includeStack: true,
  maxEntries: 1000,
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private requestId: string | null = null;
  private userId: string | null = null;
  private transactionId: string | null = null;

  constructor(config: LoggerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getLevelPriority(level: LogLevel): number {
    return LOG_LEVELS[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.config.level || 'info');
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private getRequestId(): string {
    return this.requestId || this.generateRequestId();
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getStack(): string | undefined {
    if (!this.config.includeStack) return undefined;
    const error = new Error();
    const stack = error.stack?.split('\n').slice(2).join('\n');
    return stack || undefined;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      requestId: this.config.includeRequestId ? this.getRequestId() : undefined,
      userId: this.config.includeUserId ? this.userId : undefined,
      transactionId: this.config.includeTransactionId ? this.transactionId : undefined,
      component: this.config.includeComponent ? context?.component : undefined,
      action: this.config.includeAction ? context?.action : undefined,
      stack: this.getStack(),
    };

    if (this.config.maxEntries && this.entries.length >= this.config.maxEntries) {
      this.entries.shift();
    }

    this.entries.push(entry);

    return entry;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, context);

    const logMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      case 'fatal':
        console.error(logMessage);
        break;
    }
  }

  private formatMessage(entry: LogEntry): string {
    const parts: string[] = [];

    if (this.config.includeTimestamp) {
      parts.push(`[${this.getTimestamp()}]`);
    }

    parts.push(`[${entry.level.toUpperCase()}]`);

    if (entry.requestId) {
      parts.push(`[request:${entry.requestId}]`);
    }

    if (entry.userId) {
      parts.push(`[user:${entry.userId}]`);
    }

    if (entry.transactionId) {
      parts.push(`[tx:${entry.transactionId}]`);
    }

    if (entry.component) {
      parts.push(`[${entry.component}]`);
    }

    if (entry.action) {
      parts.push(`[${entry.action}]`);
    }

    parts.push(entry.message);

    return parts.join(' ');
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: Record<string, any>): void {
    this.log('fatal', message, context);
  }

  setRequestId(id: string): void {
    this.requestId = id;
  }

  setUserId(id: string): void {
    this.userId = id;
  }

  setTransactionId(id: string): void {
    this.transactionId = id;
  }

  clearRequestId(): void {
    this.requestId = null;
  }

  clearUserId(): void {
    this.userId = null;
  }

  clearTransactionId(): void {
    this.transactionId = null;
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((entry) => entry.level === level);
  }

  getEntriesByComponent(component: string): LogEntry[] {
    return this.entries.filter((entry) => entry.component === component);
  }

  getEntriesByRequest(requestId: string): LogEntry[] {
    return this.entries.filter((entry) => entry.requestId === requestId);
  }

  clearEntries(): void {
    this.entries = [];
  }

  getStats(): {
    total: number;
    byLevel: Record<string, number>;
  } {
    const byLevel: Record<string, number> = {};

    this.entries.forEach((entry) => {
      byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
    });

    return {
      total: this.entries.length,
      byLevel,
    };
  }
}

export const logger = new Logger();
