export interface BaseError {
  name: string;
  message: string;
  stack?: string;
}

export interface ErrorMetadata {
  timestamp: number;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface ErrorHandlingConfig {
  enabled: boolean;
  logToConsole: boolean;
  logToStorage: boolean;
  logToServer: boolean;
  serverEndpoint?: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory =
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'storage'
  | 'api'
  | 'unknown';

export interface CategorizedError extends BaseError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  metadata: ErrorMetadata;
}

export interface ErrorReport {
  id: string;
  error: CategorizedError;
  context: Record<string, unknown>;
  handled: boolean;
  recovered: boolean;
  timestamp: number;
}

export interface ErrorStatistics {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  handled: number;
  unhandled: number;
  recovered: number;
}
