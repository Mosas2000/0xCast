import React from 'react';
import { AreaChart } from './AreaChart';
import { useVolumeData, useChartData } from '../hooks/analytics';
import { Card } from './Card';

export const VolumeChartSection: React.FC = () => {
    const { data, loading } = useVolumeData('7d');
    const chartData = useChartData(data, 'Volume');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Platform Volume</h3>
            </div>
            <AreaChart
                data={chartData}
                height={350}
                title="Trading Volume (STX)"
            />
        </div>
    );
};
