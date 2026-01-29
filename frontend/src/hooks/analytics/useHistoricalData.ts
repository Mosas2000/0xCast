import { useAnalytics } from './useAnalytics';
import { TimeSeriesDataPoint } from '../../types/analytics';

export function useHistoricalData(
    type: 'volume' | 'tvl' | 'users',
    timeRange: string = '30d'
) {
    const fetchHistoricalData = async () => {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 600));

        const points: TimeSeriesDataPoint[] = [];
        const now = Date.now();
        const days = parseInt(timeRange) || 30;

        for (let i = days; i >= 0; i--) {
            points.push({
                timestamp: now - (i * 24 * 60 * 60 * 1000),
                value: Math.random() * 50000 + 10000
            });
        }

        return points;
    };

    return useAnalytics(fetchHistoricalData, [type, timeRange]);
}
