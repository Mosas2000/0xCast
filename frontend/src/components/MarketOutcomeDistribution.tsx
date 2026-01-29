import React from 'react';
import { PieChart } from './PieChart';

export const MarketOutcomeDistribution: React.FC = () => {
    const data = {
        labels: ['YES', 'NO'],
        data: [72, 28],
        colors: ['#6366f1', '#f43f5e']
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-6">Outcome Probability</h4>
            <PieChart data={data} height={350} donut={false} />
        </div>
    );
};
