import React from 'react';
import { Card } from './Card';

export const MarketCorrelationMatrix: React.FC = () => {
    const correlations = [
        { pair: 'BTC/STX', score: 0.85, status: 'Strong' },
        { pair: 'ETH/STX', score: 0.72, status: 'Moderate' },
        { pair: 'SOL/STX', score: 0.45, status: 'Weak' },
        { pair: 'SPX/STX', score: 0.21, status: 'None' },
    ];

    return (
        <Card className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-6">Market Correlations</h4>
            <div className="space-y-4">
                {correlations.map((c) => (
                    <div key={c.pair} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl transition-transform hover:scale-[1.02] cursor-default">
                        <span className="font-bold text-gray-700">{c.pair}</span>
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600"
                                    style={{ width: `${c.score * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-black text-gray-900">{(c.score * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
