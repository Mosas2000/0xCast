export interface OraclePriceRecord {
  id: string;
  marketId: string;
  providerId: string;
  price: number;
  timestamp: number;
  confidence: number;
  source: string;
  aggregatedWith?: string[];
}

export interface OracleProviderRecord {
  id: string;
  name: string;
  url: string;
  healthScore: number;
  enabled: boolean;
  weight: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
  errorCount: number;
  successCount: number;
}

export interface OracleResolutionRecord {
  id: string;
  marketId: string;
  price: number;
  timestamp: number;
  consensusLevel: 'strong' | 'moderate' | 'weak' | 'none';
  confidence: number;
  providersUsed: string[];
  fallbackUsed: boolean;
  finalPrice: number;
  finalized: boolean;
}

export interface OracleConsensusRecord {
  id: string;
  marketId: string;
  priceValue: number;
  totalSources: number;
  agreeingSources: number;
  consensusPercentage: number;
  timestamp: number;
}

export interface OracleHealthRecord {
  id: string;
  providerId: string;
  timestamp: number;
  uptime: number;
  successRate: number;
  averageLatency: number;
  responseCount: number;
  failureCount: number;
}

export interface OracleAlertRecord {
  id: string;
  providerId?: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  message: string;
  resolved: boolean;
  resolvedAt?: number;
}

export interface PriceFeedSnapshot {
  id: string;
  marketId: string;
  timestamp: number;
  prices: OraclePriceRecord[];
  aggregated: number;
  consensus: string;
  confidence: number;
}
