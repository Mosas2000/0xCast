import { useState, useEffect } from 'react';
import { UserStats } from '../../types/analytics';
import { generateMockUserStats } from '../../utils/analytics/mockData';

export function useUserAnalytics(address: string | null) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!address) {
            setStats(null);
            return;
        }
        fetchStats();
    }, [address]);

    async function fetchStats() {
        if (!address) return;

        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 400));
            const data = generateMockUserStats(address);

            setStats(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }

    return { stats, isLoading, error, refetch: fetchStats };
}
