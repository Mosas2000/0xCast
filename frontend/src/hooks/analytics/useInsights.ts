import { useMemo } from 'react';
import type { PlatformMetrics } from '../../types/analytics';

export interface Insight {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    value?: string;
}

export function useInsights(metrics: PlatformMetrics | null) {
    const insights = useMemo(() => {
        if (!metrics) return [];

        const result: Insight[] = [];

        if (metrics.resolutionRate > 90) {
            result.push({
                type: 'positive',
                title: 'High Resolution Rate',
                description: 'Markets are being resolved efficiently with high accuracy.',
                value: `${metrics.resolutionRate.toFixed(1)}%`
            });
        }

        if (metrics.activeUsers24h > metrics.activeUsers7d / 5) {
            result.push({
                type: 'positive',
                title: 'Growing User Base',
                description: 'Daily active users are trending up compared to weekly average.',
                value: `+${((metrics.activeUsers24h / (metrics.activeUsers7d / 7)) * 100 - 100).toFixed(1)}%`
            });
        }

        return result;
    }, [metrics]);

    return insights;
}
