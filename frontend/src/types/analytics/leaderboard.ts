export interface LeaderboardEntry {
    rank: number;
    address: string;
    displayName?: string;
    score: number;
    change: number;
    badge?: string;
}

export type LeaderboardMetric =
    | 'volume'
    | 'winRate'
    | 'roi'
    | 'marketsCreated'
    | 'accuracy';

export interface Leaderboard {
    metric: LeaderboardMetric;
    timeRange: '24h' | '7d' | '30d' | 'allTime';
    entries: LeaderboardEntry[];
    updatedAt: number;
}
