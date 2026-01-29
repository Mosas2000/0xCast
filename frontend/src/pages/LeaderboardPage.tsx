import React from 'react';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { useLeaderboard, useTimeRange } from '../hooks/analytics';
import { Trophy, Medal, Target } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
    const { timeRange, setTimeRange } = useTimeRange('7d');
    const { leaderboard, loading, refresh } = useLeaderboard('volume', 10);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Elite Traders Leaderboard</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    The top performing participants on 0xCast. Trade smart, earn points, and climb the ranks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl transform hover:scale-[1.02] transition-transform">
                    <Trophy className="w-10 h-10 mb-4 opacity-80" />
                    <h4 className="text-lg font-bold opacity-80 mb-1">Volume Leader</h4>
                    <p className="text-2xl font-black">SP1...X2Y</p>
                    <p className="mt-4 text-sm font-medium opacity-70">150,000 STX Volume</p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-8 text-white shadow-xl transform hover:scale-[1.02] transition-transform">
                    <Medal className="w-10 h-10 mb-4 opacity-80" />
                    <h4 className="text-lg font-bold opacity-80 mb-1">ROI Master</h4>
                    <p className="text-2xl font-black">SP2...A3B</p>
                    <p className="mt-4 text-sm font-medium opacity-70">+245% Average ROI</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-white shadow-xl transform hover:scale-[1.02] transition-transform">
                    <Target className="w-10 h-10 mb-4 opacity-80" />
                    <h4 className="text-lg font-bold opacity-80 mb-1">Top Accuracy</h4>
                    <p className="text-2xl font-black">SP3...C4D</p>
                    <p className="mt-4 text-sm font-medium opacity-70">92% Prediction Accuracy</p>
                </div>
            </div>

            <AnalyticsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onRefresh={refresh}
                isRefreshing={loading}
            />

            <LeaderboardTable entries={leaderboard} loading={loading} />
        </div>
    );
};
