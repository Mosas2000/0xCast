import { MarketAnalytics, PlatformMetrics, UserStats } from '../../types/analytics';

export function generateMockMarketAnalytics(marketId: number): MarketAnalytics {
    return {
        marketId,
        question: `Mock Market #${marketId}`,
        creator: 'SP1234...ABCD',
        totalVolume: Math.random() * 10000,
        uniqueParticipants: Math.floor(Math.random() * 100),
        avgStakeSize: Math.random() * 100,
        peakVolume: Math.random() * 5000,
        volumeTrend: [],
        oddsTrend: [],
        participationRate: Math.random() * 100,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    };
}

export function generateMockPlatformMetrics(): PlatformMetrics {
    return {
        timestamp: Date.now(),
        totalMarkets: Math.floor(Math.random() * 1000),
        activeMarkets: Math.floor(Math.random() * 500),
        resolvedMarkets: Math.floor(Math.random() * 500),
        totalVolume: Math.random() * 1000000,
        tvl: Math.random() * 500000,
        uniqueUsers: Math.floor(Math.random() * 5000),
        activeUsers24h: Math.floor(Math.random() * 1000),
        activeUsers7d: Math.floor(Math.random() * 2000),
        totalStakes: Math.floor(Math.random() * 10000),
        avgMarketSize: Math.random() * 1000,
        avgTimeToResolution: Math.random() * 7 * 24 * 60 * 60 * 1000,
        resolutionRate: Math.random() * 100,
    };
}

export function generateMockUserStats(address: string): UserStats {
    const totalStaked = Math.random() * 10000;
    const totalWon = Math.random() * totalStaked;
    const totalLost = totalStaked - totalWon;

    return {
        address,
        totalStaked,
        totalWon,
        totalLost,
        realizedPnL: totalWon - totalLost,
        unrealizedPnL: Math.random() * 1000 - 500,
        totalMarkets: Math.floor(Math.random() * 50),
        activePositions: Math.floor(Math.random() * 10),
        winningPositions: Math.floor(Math.random() * 25),
        losingPositions: Math.floor(Math.random() * 25),
        winRate: Math.random() * 100,
        roi: Math.random() * 200 - 100,
        avgStakeSize: Math.random() * 500,
        largestWin: Math.random() * 2000,
        largestLoss: Math.random() * 1000,
    };
}
