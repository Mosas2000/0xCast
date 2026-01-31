export interface ReputationLevel {
    level: number;
    title: string;
    minScore: number;
    color: string;
    icon: string;
}

export const REPUTATION_LEVELS: ReputationLevel[] = [
    { level: 1, title: 'Novice', minScore: 0, color: 'gray', icon: '🌱' },
    { level: 2, title: 'Apprentice', minScore: 100, color: 'blue', icon: '📘' },
    { level: 3, title: 'Trader', minScore: 500, color: 'green', icon: '💹' },
    { level: 4, title: 'Expert', minScore: 1000, color: 'purple', icon: '🎯' },
    { level: 5, title: 'Master', minScore: 5000, color: 'orange', icon: '👑' },
    { level: 6, title: 'Legend', minScore: 10000, color: 'red', icon: '🏆' },
];

export const calculateReputation = (stats: {
    totalTrades: number;
    winRate: number;
    marketsCreated: number;
    profitLoss: number;
}): number => {
    let score = 0;

    // Base points from trades
    score += stats.totalTrades * 10;

    // Bonus for win rate
    if (stats.winRate > 50) {
        score += (stats.winRate - 50) * 20;
    }

    // Points for market creation
    score += stats.marketsCreated * 50;

    // Bonus for profitability
    if (stats.profitLoss > 0) {
        score += Math.min(stats.profitLoss / 10, 1000);
    }

    return Math.floor(score);
};

export const getReputationLevel = (score: number): ReputationLevel => {
    for (let i = REPUTATION_LEVELS.length - 1; i >= 0; i--) {
        if (score >= REPUTATION_LEVELS[i].minScore) {
            return REPUTATION_LEVELS[i];
        }
    }
    return REPUTATION_LEVELS[0];
};

export const getProgressToNextLevel = (score: number): {
    current: ReputationLevel;
    next: ReputationLevel | null;
    progress: number;
} => {
    const current = getReputationLevel(score);
    const currentIndex = REPUTATION_LEVELS.findIndex((l) => l.level === current.level);
    const next = currentIndex < REPUTATION_LEVELS.length - 1 ? REPUTATION_LEVELS[currentIndex + 1] : null;

    if (!next) {
        return { current, next: null, progress: 100 };
    }

    const progress = ((score - current.minScore) / (next.minScore - current.minScore)) * 100;
    return { current, next, progress: Math.min(progress, 100) };
};
