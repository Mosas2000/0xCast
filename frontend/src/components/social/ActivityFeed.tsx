import React, { useState, useEffect } from 'react';

interface ActivityItem {
    id: string;
    type: 'trade' | 'market_created' | 'market_resolved';
    user: {
        address: string;
        avatar?: string;
    };
    details: string;
    timestamp: string;
}

export const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated real-time activity data
        const mockActivities: ActivityItem[] = [
            {
                id: '1',
                type: 'trade',
                user: { address: 'SP31...W5T' },
                details: 'staked 100 STX on "Yes" for Nakamoto Upgrade',
                timestamp: '2 mins ago',
            },
            {
                id: '2',
                type: 'market_created',
                user: { address: 'SP2A...KJG' },
                details: 'created a new market: "Will BTC reach $100k?"',
                timestamp: '15 mins ago',
            },
            {
                id: '3',
                type: 'market_resolved',
                user: { address: 'SP1P...XYZ' },
                details: 'resolved market "US Election 2024" to "Democratic"',
                timestamp: '1 hour ago',
            },
        ];

        setTimeout(() => {
            setActivities(mockActivities);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Live Activity</h3>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            <div className="divide-y divide-slate-800">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 text-sm">Syncing with blockchain...</p>
                    </div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-slate-800/30 transition-colors group cursor-pointer">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                    {item.type === 'trade' && '💰'}
                                    {item.type === 'market_created' && '📊'}
                                    {item.type === 'market_resolved' && '✅'}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm text-white">
                                        <span className="font-bold text-primary-400 font-mono">{item.user.address}</span>
                                        <span className="ml-1 text-slate-300">{item.details}</span>
                                    </p>
                                    <p className="text-xs text-slate-500">{item.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full p-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                View All Activity
            </button>
        </div>
    );
};
