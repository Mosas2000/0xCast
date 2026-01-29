import { useMemo } from 'react';
import type { TimeSeriesDataPoint, LineChartData } from '../../types/analytics';
import { formatTimestamp } from '../../utils/analytics';

export function useChartData(
    data: TimeSeriesDataPoint[],
    label: string = 'Value'
): LineChartData {
    return useMemo(() => {
        if (!data || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = data.map(point => formatTimestamp(point.timestamp));
        const values = data.map(point => point.value);

        return {
            labels,
            datasets: [{
                label,
                data: values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true
            }]
        };
    }, [data, label]);
}
