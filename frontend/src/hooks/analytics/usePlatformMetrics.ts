import { useState, useEffect } from 'react';
import type { PlatformMetrics } from '../../types/analytics';
import { generateMockPlatformMetrics } from '../../utils/analytics/mockData';

export function usePlatformMetrics(timeRange: string = '24h') {
    const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchMetrics();
    }, [timeRange]);

    async function fetchMetrics() {
        try {
            setIsLoading(true);

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = generateMockPlatformMetrics();

            setMetrics(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }

    return { metrics, isLoading, error, refetch: fetchMetrics };
}
