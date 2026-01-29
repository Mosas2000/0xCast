import { useMemo } from 'react';
import { MetricValue } from '../../types/analytics';
import { calculatePercentageChange, calculateTrend } from '../../utils/analytics';

export function useComparison(current: number, previous: number): MetricValue {
    return useMemo(() => ({
        current,
        previous,
        change: current - previous,
        changePercent: calculatePercentageChange(current, previous),
        trend: calculateTrend(current, previous)
    }), [current, previous]);
}
