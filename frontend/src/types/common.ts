export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type RecordValue = string | number | boolean | null | undefined | RecordValue[] | { [key: string]: RecordValue };

export interface UnknownRecord {
  [key: string]: RecordValue;
}

export interface EventCallback<T = void> {
  (data: T): void;
}

export interface AsyncEventCallback<T = void> {
  (data: T): Promise<void>;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogData {
  [key: string]: RecordValue;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailureTime: number;
  nextRetry: number;
}

export interface UserMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageResponseTime: number;
  accountAge: number;
  verificationLevel: number;
}

export interface KYCDocumentData {
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  documentNumber?: string;
  expiryDate?: string;
  issueDate?: string;
}

export interface TransactionData {
  id: string;
  timestamp: number;
  amount: number;
  type: string;
  status: string;
  [key: string]: RecordValue;
}

export interface AccountData {
  id: string;
  userId: string;
  type: string;
  createdAt: number;
  [key: string]: RecordValue;
}

export interface FraudTransaction {
  id: string;
  timestamp: number;
  price: number;
  volume: number;
  marketId: string;
  userId?: string;
}

export interface FraudAccount {
  id: string;
  ipAddress: string;
  createdAt: number;
  tradingPatterns: {
    averageVolume: number;
    tradingFrequency: number;
    preferredMarkets: string[];
  };
}

export interface FraudOrderBookEntry {
  id: string;
  volume: number;
  price: number;
  cancelled: boolean;
  timestamp: number;
}

export interface FraudUserProfile {
  userId: string;
  createdAt: number;
  totalTransactions: number;
  averageTransactionSize: number;
  accountAge: number;
}
