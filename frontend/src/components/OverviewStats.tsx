import React from 'react';
import { MetricCard } from './MetricCard';
import { usePlatformMetrics } from '../hooks/analytics';
import { Activity, BarChart3, Users, Zap } from 'lucide-react';

export const OverviewStats: React.FC = () => {
    const { metrics, loading } = usePlatformMetrics('24h');

    const stats = [
        {
            title: 'Total Volume',
            value: metrics?.totalVolume || 0,
            previous: metrics?.totalVolume ? metrics.totalVolume * 0.9 : 0,
            trend: 'up' as const,
            changePercent: 12.5,
            type: 'stx' as const,
            icon: <Activity className="w-5 h-5" />
        },
        {
            title: 'Active Markets',
            value: metrics?.activeMarkets || 0,
            previous: (metrics?.activeMarkets || 0) - 5,
            trend: 'up' as const,
            changePercent: 8.2,
            type: 'number' as const,
            icon: <BarChart3 className="w-5 h-5" />
        },
        {
            title: 'Active Users',
            value: metrics?.activeUsers24h || 0,
            previous: metrics?.activeUsers7d ? metrics.activeUsers7d / 7 : 0,
            trend: 'down' as const,
            changePercent: -3.1,
            type: 'number' as const,
            icon: <Users className="w-5 h-5" />
        },
        {
            title: 'Resolution Rate',
            value: metrics?.resolutionRate || 0,
            previous: 92.5,
            trend: 'up' as const,
            changePercent: 1.4,
            type: 'percentage' as const,
            icon: <Zap className="w-5 h-5" />
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <MetricCard
                    key={stat.title}
                    title={stat.title}
                    metric={{
                        current: stat.value,
                        previous: stat.previous,
                        change: stat.value - stat.previous,
                        changePercent: stat.changePercent,
                        trend: stat.trend
                    }}
                    type={stat.type}
                    icon={stat.icon}
                    loading={loading}
                />
            ))}
        </div>
    );
};
