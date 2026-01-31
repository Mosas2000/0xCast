import React, { useState } from 'react';

interface LeaderboardEntry {
    rank: number;
    address: string;
    username: string;
    avatar: string;
    stats: {
        totalTrades: number;
        winRate: number;
        profitLoss: number;
        reputationScore: number;
    };
}

interface LeaderboardCardProps {
    entry: LeaderboardEntry;
    onUserClick?: (address: string) => void;
    highlightUser?: string;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
    entry,
    onUserClick,
    highlightUser,
}) => {
    const isHighlighted = entry.address === highlightUser;

    const getRankBadge = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-600';
        if (rank === 2) return 'text-gray-500';
        if (rank === 3) return 'text-orange-600';
        return 'text-gray-700';
    };

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${isHighlighted
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
        >
            {/* Rank */}
            <div className={`text-2xl font-bold ${getRankColor(entry.rank)} w-12 text-center`}>
                {getRankBadge(entry.rank)}
            </div>

            {/* User Info */}
            <button
                onClick={() => onUserClick?.(entry.address)}
                className="flex items-center gap-3 flex-1"
            >
                <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                />
                <div className="text-left">
                    <div className="font-semibold text-gray-900">{entry.username}</div>
                    <div className="text-sm text-gray-500">
                        {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </div>
                </div>
            </button>

            {/* Stats */}
            <div className="hidden md:flex gap-6 text-sm">
                <div className="text-center">
                    <div className="text-gray-500">Trades</div>
                    <div className="font-semibold text-gray-900">{entry.stats.totalTrades}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-500">Win Rate</div>
                    <div className="font-semibold text-green-600">{entry.stats.winRate.toFixed(1)}%</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-500">P/L</div>
                    <div className={`font-semibold ${entry.stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${entry.stats.profitLoss.toFixed(0)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-gray-500">Score</div>
                    <div className="font-semibold text-purple-600">{entry.stats.reputationScore}</div>
                </div>
            </div>
        </div>
    );
};
