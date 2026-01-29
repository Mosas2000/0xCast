import React from 'react';
import { AreaChart } from './AreaChart';
import { useChartData } from '../hooks/analytics';

interface MarketVolumeHistoryProps {
    data: any[];
}

export const MarketVolumeHistory: React.FC<MarketVolumeHistoryProps> = ({ data }) => {
    const chartData = useChartData(data, 'Market Volume');

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-xl font-bold text-gray-900">Volume History</h4>
                    <p className="text-gray-500 text-sm">Trading volume over the selected period</p>
                </div>
            </div>
            <AreaChart data={chartData} height={400} />
        </div>
    );
};
