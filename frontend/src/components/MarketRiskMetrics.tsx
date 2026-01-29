import React from 'react';
import { Card } from './Card';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

export const MarketRiskMetrics: React.FC = () => {
    const metrics = [
        { label: 'Volatility', value: 'Low', score: 24, icon: <Activity className="w-5 h-5" />, color: 'bg-green-100 text-green-700' },
        { label: 'Liquidity Risk', value: 'Medium', score: 58, icon: <Shield className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-700' },
        { label: 'Concentration', value: 'High', score: 82, icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-100 text-red-700' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m) => (
                <Card key={m.label} className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-2 rounded-xl bg-gray-50 text-gray-600`}>
                            {m.icon}
                        </div>
                        <h5 className="font-bold text-gray-900">{m.label}</h5>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${m.color}`}>
                            {m.value}
                        </span>
                        <span className="text-2xl font-black text-gray-900">{m.score}/100</span>
                    </div>
                    <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${m.color.split(' ')[1].replace('text-', 'bg-')}`}
                            style={{ width: `${m.score}%` }}
                        />
                    </div>
                </Card>
            ))}
        </div>
    );
};
