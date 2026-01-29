import { useState, useEffect } from 'react';
import { Leaderboard, LeaderboardMetric } from '../../types/analytics';

export function useLeaderboard(
    metric: LeaderboardMetric = 'volume',
    timeRange: '24h' | '7d' | '30d' | 'allTime' = '7d'
) {
    const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [metric, timeRange]);

    async function fetchLeaderboard() {
        try {
            setIsLoading(true);

            // Generate mock leaderboard
            await new Promise(resolve => setTimeout(resolve, 300));

            const entries = Array.from({ length: 10 }, (_, i) => ({
                rank: i + 1,
                address: `SP${Math.random().toString(36).substring(7).toUpperCase()}`,
                score: Math.random() * 100000,
                change: Math.floor(Math.random() * 10) - 5,
                badge: i < 3 ? ['🥇', '🥈', '🥉'][i] : undefined
            }));

            setLeaderboard({
                metric,
                timeRange,
                entries,
                updatedAt: Date.now()
            });

            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }

    return { leaderboard, isLoading, error, refetch: fetchLeaderboard };
}
