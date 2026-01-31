import React, { useState } from 'react';
import { LeaderboardCard } from './LeaderboardCard';

type LeaderboardCategory = 'reputation' | 'profit' | 'winRate' | 'volume';

interface LeaderboardProps {
    currentUserAddress?: string;
    onUserClick?: (address: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
    currentUserAddress,
    onUserClick,
}) => {
    const [category, setCategory] = useState<LeaderboardCategory>('reputation');
    const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

    // Mock data - in real app, fetch from API
    const [entries] = useState(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            rank: i + 1,
            address: `SP${Math.random().toString(36).substring(7).toUpperCase()}`,
            username: `Trader${Math.floor(Math.random() * 10000)}`,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`,
            stats: {
                totalTrades: Math.floor(Math.random() * 500) + 50,
                winRate: Math.random() * 40 + 40, // 40-80%
                profitLoss: (Math.random() - 0.3) * 10000,
                reputationScore: Math.floor(Math.random() * 10000) + 1000,
            },
        })).sort((a, b) => b.stats.reputationScore - a.stats.reputationScore);
    });

    const sortedEntries = [...entries].sort((a, b) => {
        switch (category) {
            case 'reputation':
                return b.stats.reputationScore - a.stats.reputationScore;
            case 'profit':
                return b.stats.profitLoss - a.stats.profitLoss;
            case 'winRate':
                return b.stats.winRate - a.stats.winRate;
            case 'volume':
                return b.stats.totalTrades - a.stats.totalTrades;
            default:
                return 0;
        }
    }).map((entry, index) => ({ ...entry, rank: index + 1 }));

    const categories = [
        { value: 'reputation' as const, label: '🏆 Reputation', icon: '🏆' },
        { value: 'profit' as const, label: '💰 Profit', icon: '💰' },
        { value: 'winRate' as const, label: '🎯 Win Rate', icon: '🎯' },
        { value: 'volume' as const, label: '📊 Volume', icon: '📊' },
    ];

    const timeframes = [
        { value: 'all' as const, label: 'All Time' },
        { value: 'month' as const, label: 'This Month' },
        { value: 'week' as const, label: 'This Week' },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">🏆 Leaderboard</h1>

                {/* Category Filters */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${category === cat.value
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeframe Filters */}
                <div className="flex gap-2">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => setTimeframe(tf.value)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeframe === tf.value
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-2">
                {sortedEntries.slice(0, 100).map((entry) => (
                    <LeaderboardCard
                        key={entry.address}
                        entry={entry}
                        onUserClick={onUserClick}
                        highlightUser={currentUserAddress}
                    />
                ))}
            </div>

            {/* Load More */}
            {sortedEntries.length > 100 && (
                <div className="mt-6 text-center">
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};
