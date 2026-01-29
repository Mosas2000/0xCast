import { useState, useEffect } from 'react';
import type { TimeSeriesDataPoint } from '../../types/analytics';

export function useVolumeData(timeRange: string = '7d') {
    const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchVolumeData();
    }, [timeRange]);

    async function fetchVolumeData() {
        try {
            setIsLoading(true);

            // Generate mock data
            const points: TimeSeriesDataPoint[] = [];
            const now = Date.now();
            const interval = timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            const count = timeRange === '24h' ? 24 : 7;

            for (let i = count; i >= 0; i--) {
                points.push({
                    timestamp: now - (i * interval),
                    value: Math.random() * 10000 + 5000
                });
            }

            setData(points);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }

    return { data, isLoading, error, refetch: fetchVolumeData };
}
