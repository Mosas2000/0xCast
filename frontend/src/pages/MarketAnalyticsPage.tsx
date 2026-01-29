import React from 'react';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { MetricGroup } from '../components/MetricGroup';
import { MetricCard } from '../components/MetricCard';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { useMarketAnalytics, useTimeRange } from '../hooks/analytics';
import { useParams } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';

export const MarketAnalyticsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const marketId = parseInt(id || '0');
    const { timeRange, setTimeRange } = useTimeRange('24h');
    const { analytics, loading, refresh } = useMarketAnalytics(marketId);

    if (!analytics && !loading) return (
        <div className="p-12 text-center text-gray-500">Market analytics not found.</div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AnalyticsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onRefresh={refresh}
                isRefreshing={loading}
            />

            <div className="space-y-12">
                <MetricGroup title="Market Snapshot">
                    <MetricCard
                        title="Current Volume"
                        metric={{ current: analytics?.volume || 0, previous: (analytics?.volume || 0) * 0.9, trend: 'up' }}
                        type="stx"
                        icon={<DollarSign className="w-5 h-5" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Participants"
                        metric={{ current: analytics?.participants || 0, previous: (analytics?.participants || 0) - 2, trend: 'up' }}
                        type="number"
                        icon={<Users className="w-5 h-5" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Liquidity"
                        metric={{ current: analytics?.liquidity || 0, previous: (analytics?.liquidity || 0) * 0.95, trend: 'up' }}
                        type="stx"
                        icon={<TrendingUp className="w-5 h-5" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Outcome Confidence"
                        metric={{ current: 78, previous: 75, trend: 'up' }}
                        type="percentage"
                        icon={<Award className="w-5 h-5" />}
                        loading={loading}
                    />
                </MetricGroup>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <LineChart
                        title="Volume History"
                        data={{
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{
                                label: 'Volume',
                                data: [1200, 1500, 1100, 1800, 2200, 1900, 2500],
                                borderColor: '#6366f1'
                            }]
                        }}
                        areaStyle
                    />
                    <BarChart
                        title="Outcome Distribution"
                        data={{
                            labels: ['YES', 'NO', 'UNLIKELY'],
                            datasets: [{
                                label: 'Shares',
                                data: [45000, 22000, 5000],
                                backgroundColor: '#818cf8'
                            }]
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
