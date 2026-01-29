import React from 'react';
import { TimeRangeSelector } from './TimeRangeSelector';
import { ExportButton } from './ExportButton';
import { RefreshCcw } from 'lucide-react';
import { TIME_RANGES } from '../constants/analytics';
import type { TimeRangeKey } from '../hooks/analytics/useTimeRange';

interface AnalyticsHeaderProps {
    timeRange: TimeRangeKey;
    onTimeRangeChange: (range: TimeRangeKey) => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
    timeRange,
    onTimeRangeChange,
    onRefresh,
    isRefreshing = false
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1 font-medium">Real-time insights and platform metrics</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100"
                >
                    <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                <TimeRangeSelector
                    selectedRange={timeRange}
                    onRangeChange={onTimeRangeChange}
                    ranges={TIME_RANGES}
                />

                <ExportButton onExport={() => { }} />
            </div>
        </div>
    );
};
