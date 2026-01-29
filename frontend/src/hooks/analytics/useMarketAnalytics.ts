import { useState, useEffect } from 'react';
import type { MarketAnalytics } from '../../types/analytics';
import { generateMockMarketAnalytics } from '../../utils/analytics/mockData';

export function useMarketAnalytics(marketId: number) {
    const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!marketId) return;
        fetchAnalytics();
    }, [marketId]);

    async function fetchAnalytics() {
        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 300));
            const data = generateMockMarketAnalytics(marketId);

            setAnalytics(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }

    return { analytics, isLoading, error, refetch: fetchAnalytics };
}
