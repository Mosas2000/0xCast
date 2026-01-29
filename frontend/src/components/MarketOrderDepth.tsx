import React from 'react';
import { BarChart } from './BarChart';

export const MarketOrderDepth: React.FC = () => {
    const data = {
        labels: ['-5%', '-2%', '-1%', 'Price', '+1%', '+2%', '+5%'],
        datasets: [
            {
                label: 'Bid Depth',
                data: [12000, 8000, 5000, 0, 0, 0, 0],
                backgroundColor: 'rgba(34, 197, 94, 0.6)'
            },
            {
                label: 'Ask Depth',
                data: [0, 0, 0, 0, 4500, 7200, 11000],
                backgroundColor: 'rgba(239, 68, 68, 0.6)'
            }
        ]
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-6">Market Order Depth</h4>
            <BarChart data={data} height={400} />
        </div>
    );
};
