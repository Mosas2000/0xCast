import React from 'react';
import { PieChart } from './PieChart';

export const MarketSentimentChart: React.FC = () => {
    const data = {
        labels: ['Bullish', 'Bearish', 'Neutral'],
        data: [65, 25, 10],
        colors: ['#22c55e', '#ef4444', '#94a3b8']
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-6">Market Sentiment</h4>
            <PieChart data={data} height={350} donut={true} />
        </div>
    );
};
