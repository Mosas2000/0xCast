import { useMemo } from 'react';
import { TimeSeriesDataPoint } from '../../types/analytics';

export function useDataAggregation(
    data: TimeSeriesDataPoint[],
    interval: 'hour' | 'day' | 'week' | 'month' = 'day'
) {
    const aggregated = useMemo(() => {
        if (!data || data.length === 0) return [];

        const intervalMs = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        }[interval];

        const groups = new Map<number, number[]>();

        data.forEach(point => {
            const bucket = Math.floor(point.timestamp / intervalMs) * intervalMs;
            if (!groups.has(bucket)) {
                groups.set(bucket, []);
            }
            groups.get(bucket)!.push(point.value);
        });

        return Array.from(groups.entries()).map(([timestamp, values]) => ({
            timestamp,
            value: values.reduce((sum, v) => sum + v, 0) / values.length
        }));
    }, [data, interval]);

    return aggregated;
}
