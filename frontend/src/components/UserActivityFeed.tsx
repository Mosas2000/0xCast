import React from 'react';
import { Card } from './Card';
import { getRelativeTime } from '../utils/analytics';
import { User, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const UserActivityFeed: React.FC = () => {
    const activities = [
        { id: 1, user: 'SP2...X4Y', action: 'placed a bet', amount: '500 STX', market: 'BTC Price', time: Date.now() - 1000 * 60 * 5, type: 'buy' },
        { id: 2, user: 'SP3...A9B', action: 'resolved market', amount: '', market: 'ETH ETF', time: Date.now() - 1000 * 60 * 20, type: 'resolve' },
        { id: 3, user: 'SP1...K2L', action: 'withdrew rewards', amount: '1,200 STX', market: '', time: Date.now() - 1000 * 60 * 45, type: 'sell' },
        { id: 4, user: 'SP4...M6N', action: 'placed a bet', amount: '250 STX', market: 'STX Upgrade', time: Date.now() - 1000 * 60 * 120, type: 'buy' },
    ];

    return (
        <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">Live Activity</h4>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="divide-y divide-gray-50">
                {activities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${activity.type === 'buy' ? 'bg-green-50 text-green-600' :
                                    activity.type === 'sell' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {activity.type === 'buy' ? <ArrowUpRight className="w-4 h-4" /> :
                                    activity.type === 'sell' ? <ArrowDownRight className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">{activity.user}</span>
                                    {' '}{activity.action}{' '}
                                    {activity.amount && <span className="font-bold text-indigo-600">{activity.amount}</span>}
                                    {activity.market && <span> on <span className="font-medium text-gray-900">{activity.market}</span></span>}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{getRelativeTime(activity.time)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
