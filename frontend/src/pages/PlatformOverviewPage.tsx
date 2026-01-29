import React from 'react';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { OverviewStats } from '../components/OverviewStats';
import { VolumeChartSection } from '../components/VolumeChartSection';
import { MarketPerformanceList } from '../components/MarketPerformanceList';
import { UserActivityFeed } from '../components/UserActivityFeed';
import { PlatformInsights } from '../components/PlatformInsights';
import { DataExportSection } from '../components/DataExportSection';
import { useTimeRange } from '../hooks/analytics';

export const PlatformOverviewPage: React.FC = () => {
    const { timeRange, setTimeRange } = useTimeRange('24h');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
            <AnalyticsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onRefresh={() => { }}
            />

            <PlatformInsights />

            <OverviewStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    <VolumeChartSection />
                    <MarketPerformanceList />
                </div>
                <div className="space-y-8">
                    <UserActivityFeed />
                    <DataExportSection />
                </div>
            </div>
        </div>
    );
};
