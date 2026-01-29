import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { MarketAnalytics } from '../types/analytics';
import { TrendingUp, Droplets, Target, Clock } from 'lucide-react';

interface MarketStatsSectionProps {
    analytics: MarketAnalytics;
    loading: boolean;
}

export const MarketStatsSection: React.FC<MarketStatsSectionProps> = ({
    analytics,
    loading
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="24h Volume"
                metric={{ current: analytics.volume, previous: analytics.volume * 0.8, trend: 'up' }}
                type="stx"
                icon={<TrendingUp className="w-5 h-5" />}
                loading={loading}
            />
            <MetricCard
                title="Liquidity Depth"
                metric={{ current: analytics.liquidity, previous: analytics.liquidity * 1.1, trend: 'down' }}
                type="stx"
                icon={<Droplets className="w-5 h-5" />}
                loading={loading}
            />
            <MetricCard
                title="Unique Traders"
                metric={{ current: analytics.participants, previous: analytics.participants - 10, trend: 'up' }}
                type="number"
                icon={<Target className="w-5 h-5" />}
                loading={loading}
            />
            <MetricCard
                title="Estimated Resolution"
                metric={{ current: 0, previous: 0, trend: 'neutral' }}
                type="number"
                icon={<Clock className="w-5 h-5" />}
                loading={loading}
            />
        </div>
    );
};
