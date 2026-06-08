export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
}

export interface LoggerConfig {
  maxEntries: number;
  persistToStorage: boolean;
  storageKey: string;
  consoleOutput: boolean;
}

export class ErrorLogger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      maxEntries: config.maxEntries ?? 1000,
      persistToStorage: config.persistToStorage ?? true,
      storageKey: config.storageKey ?? 'error_logs',
      consoleOutput: config.consoleOutput ?? true,
    };

    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): string {
    return this.log('error', message, error, context);
  }

  warn(message: string, context?: Record<string, unknown>): string {
    return this.log('warn', message, undefined, context);
  }

  info(message: string, context?: Record<string, unknown>): string {
    return this.log('info', message, undefined, context);
  }

  debug(message: string, context?: Record<string, unknown>): string {
    return this.log('debug', message, undefined, context);
  }

  private log(
    level: LogEntry['level'],
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): string {
    const id = this.generateId();
    const entry: LogEntry = {
      id,
      timestamp: Date.now(),
      level,
      message,
      error,
      context,
    };

    this.logs.push(entry);

    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    if (this.config.consoleOutput) {
      this.outputToConsole(entry);
    }

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }

    return id;
  }

  getLogs(options: {
    level?: LogEntry['level'];
    limit?: number;
    offset?: number;
  } = {}): LogEntry[] {
    let filtered = [...this.logs];

    if (options.level) {
      filtered = filtered.filter((log) => log.level === options.level);
    }

    const offset = options.offset ?? 0;
    const limit = options.limit ?? filtered.length;

    return filtered.slice(offset, offset + limit);
  }

  getLogById(id: string): LogEntry | null {
    return this.logs.find((log) => log.id === id) || null;
  }

  clear(): void {
    this.logs = [];
    if (this.config.persistToStorage) {
      this.clearStorage();
    }
  }

  getStats(): {
    total: number;
    byLevel: Record<string, number>;
  } {
    const byLevel: Record<string, number> = {
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
    };

    this.logs.forEach((log) => {
      byLevel[log.level]++;
    });

    return {
      total: this.logs.length,
      byLevel,
    };
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const data = {
      message: entry.message,
      timestamp: new Date(entry.timestamp).toISOString(),
      context: entry.context,
    };

    switch (entry.level) {
      case 'error':
        console.error(prefix, data, entry.error);
        break;
      case 'warn':
        console.warn(prefix, data);
        break;
      case 'info':
        console.info(prefix, data);
        break;
      case 'debug':
        console.debug(prefix, data);
        break;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.logs));
    } catch {
      console.error('Failed to save logs to storage');
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      console.error('Failed to load logs from storage');
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch {
      console.error('Failed to clear logs from storage');
    }
  }
}

export const errorLogger = new ErrorLogger();
