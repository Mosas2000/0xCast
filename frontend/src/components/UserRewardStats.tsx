import React from 'react';
import { Card } from './Card';
import { Zap, Gift, Timer } from 'lucide-react';

export const UserRewardStats: React.FC = () => {
    const rewards = [
        { label: 'Total Earned', value: '2,450 STX', icon: <Gift className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
        { label: 'Pending Rewards', value: '120 STX', icon: <Timer className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Active Boosts', value: '2.5x', icon: <Zap className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewards.map((r) => (
                <Card key={r.label} className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{r.label}</p>
                            <h4 className="text-2xl font-black text-gray-900">{r.value}</h4>
                        </div>
                        <div className={`p-3 rounded-2xl ${r.color}`}>
                            {r.icon}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
