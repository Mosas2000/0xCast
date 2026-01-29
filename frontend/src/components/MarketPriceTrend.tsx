import React from 'react';
import { LineChart } from './LineChart';

export const MarketPriceTrend: React.FC = () => {
    const data = {
        labels: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        datasets: [
            {
                label: 'YES Price',
                data: [0.45, 0.48, 0.52, 0.50, 0.55, 0.58, 0.62],
                borderColor: '#6366f1'
            },
            {
                label: 'NO Price',
                data: [0.55, 0.52, 0.48, 0.50, 0.45, 0.42, 0.38],
                borderColor: '#f43f5e'
            }
        ]
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-6">Price Trend (STX)</h4>
            <LineChart data={data} height={400} />
        </div>
    );
};
