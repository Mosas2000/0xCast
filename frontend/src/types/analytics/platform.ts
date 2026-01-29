export interface PlatformMetrics {
    timestamp: number;
    totalMarkets: number;
    activeMarkets: number;
    resolvedMarkets: number;
    totalVolume: number;
    tvl: number;
    uniqueUsers: number;
    activeUsers24h: number;
    activeUsers7d: number;
    totalStakes: number;
    avgMarketSize: number;
    avgTimeToResolution: number;
    resolutionRate: number;
}

export interface VolumeMetrics {
    hourly: number[];
    daily: number[];
    weekly: number[];
    monthly: number[];
}
