import { TimeSeriesDataPoint } from './base';

export interface MarketSnapshot {
    marketId: number;
    timestamp: number;
    yesStake: number;
    noStake: number;
    totalPool: number;
    oddsYes: number;
    oddsNo: number;
    participantCount: number;
}

export interface MarketAnalytics {
    marketId: number;
    question: string;
    creator: string;
    totalVolume: number;
    uniqueParticipants: number;
    avgStakeSize: number;
    peakVolume: number;
    volumeTrend: TimeSeriesDataPoint[];
    oddsTrend: TimeSeriesDataPoint[];
    participationRate: number;
    createdAt: number;
    resolvedAt?: number;
    timeToResolution?: number;
}
