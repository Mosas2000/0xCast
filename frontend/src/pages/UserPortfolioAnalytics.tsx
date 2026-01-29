import React from 'react';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { MetricGroup } from '../components/MetricGroup';
import { MetricCard } from '../components/MetricCard';
import { LineChart } from '../components/LineChart';
import { PieChart } from '../components/PieChart';
import { DataTable } from '../components/DataTable';
import { useUserAnalytics, useTimeRange } from '../hooks/analytics';
import { Wallet, TrendingUp, Award, History } from 'lucide-react';

export const UserPortfolioAnalytics: React.FC = () => {
    const { timeRange, setTimeRange } = useTimeRange('24h');
    const { stats, loading, refresh } = useUserAnalytics('SP123...'); // Mock address

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AnalyticsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onRefresh={refresh}
                isRefreshing={loading}
            />

            <div className="space-y-12">
                <MetricGroup title="Portfolio Overview">
                    <MetricCard
                        title="Total Value"
                        metric={{ current: stats?.totalValue || 0, previous: (stats?.totalValue || 0) * 0.92, trend: 'up' }}
                        type="stx"
                        icon={<Wallet className="w-5 h-5" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Profit"
                        metric={{ current: stats?.totalProfit || 0, previous: (stats?.totalProfit || 0) * 0.85, trend: 'up' }}
                        type="stx"
                        icon={<TrendingUp className="w-5 h-5" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Win Rate"
                        metric={{ current: stats?.winRate || 0, previous: (stats?.winRate || 0) - 2, trend: 'up' }}
                        type="percentage"
                        icon={<Award className="w-5 h-5" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Trades"
                        metric={{ current: stats?.tradesCount || 0, previous: (stats?.tradesCount || 0) - 5, trend: 'up' }}
                        type="number"
                        icon={<History className="w-5 h-5" />}
                        loading={loading}
                    />
                </MetricGroup>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <LineChart
                        title="Profit Performance"
                        data={{
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Profit (STX)',
                                data: [100, 250, 200, 450, 600, 850],
                                borderColor: '#10b981'
                            }]
                        }}
                        areaStyle
                    />
                    <PieChart
                        title="Asset Allocation"
                        data={{
                            labels: ['Crypto', 'Sports', 'Politics', 'Other'],
                            data: [60, 25, 10, 5],
                            colors: ['#6366f1', '#f59e0b', '#ef4444', '#94a3b8']
                        }}
                    />
                </div>

                <DataTable
                    title="Recent Transactions"
                    columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'market', label: 'Market' },
                        { key: 'type', label: 'Type', render: (val) => <span className={`font-bold ${val === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>{val}</span> },
                        { key: 'amount', label: 'Amount', render: (val) => <span className="font-bold">{val} STX</span> },
                        { key: 'status', label: 'Status' },
                    ]}
                    data={[
                        { date: '2026-01-28', market: 'BTC Price', type: 'Buy', amount: 500, status: 'Completed' },
                        { date: '2026-01-27', market: 'ETH ETF', type: 'Sell', amount: 1200, status: 'Completed' },
                        { date: '2026-01-25', market: 'STX Upgrade', type: 'Buy', amount: 250, status: 'Completed' },
                    ]}
                />
            </div>
        </div>
    );
};
