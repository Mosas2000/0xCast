export interface UserStats {
    address: string;
    totalStaked: number;
    totalWon: number;
    totalLost: number;
    realizedPnL: number;
    unrealizedPnL: number;
    totalMarkets: number;
    activePositions: number;
    winningPositions: number;
    losingPositions: number;
    winRate: number;
    roi: number;
    avgStakeSize: number;
    largestWin: number;
    largestLoss: number;
}

export interface UserPerformance {
    daily: UserStats;
    weekly: UserStats;
    monthly: UserStats;
    allTime: UserStats;
}
