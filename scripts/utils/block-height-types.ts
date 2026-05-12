export type Network = 'mainnet' | 'testnet' | 'devnet';

export interface BlockHeightFetchOptions {
    maxRetries?: number;
    retryDelayMs?: number;
    timeoutMs?: number;
    useCache?: boolean;
}

export interface MarketBlockHeights {
    currentBlock: number;
    endBlock: number;
    resolutionBlock: number;
}

export interface BlockHeightValidation {
    valid: boolean;
    errors: string[];
}

export interface BlockHeightCalculationOptions {
    durationDays?: number;
    resolutionBufferDays?: number;
}

export interface BlockHeightStatistics {
    totalSnapshots: number;
    blockRate: number | null;
    averageBlockTime: number | null;
    firstSnapshot?: {
        height: number;
        timestamp: number;
    };
    lastSnapshot?: {
        height: number;
        timestamp: number;
    };
}

export interface BlockHeightMonitorConfig {
    network: Network;
    intervalMs: number;
    maxSnapshots?: number;
}

export interface BlockHeightCacheEntry {
    height: number;
    timestamp: number;
    source: 'api' | 'manual' | 'cache';
    network: Network;
}

export interface BlockHeightRecoveryResult {
    success: boolean;
    currentBlock?: number;
    endBlock?: number;
    resolutionBlock?: number;
    error?: string;
    attempts: number;
    duration?: number;
}

export interface BlockHeightFormattingOptions {
    includeCommas?: boolean;
    includeUnits?: boolean;
    precision?: number;
}

export interface BlockHeightRange {
    start: number;
    end: number;
    duration: number;
}

export interface BlockHeightProgress {
    current: number;
    total: number;
    percentage: number;
    remaining: number;
}
