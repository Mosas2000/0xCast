import React from 'react';
import { Card } from './Card';
import { formatNumber } from '../utils/analytics';
import type { LeaderboardEntry } from '../types/analytics';

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    loading?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
    entries,
    loading = false
}) => {
    return (
        <Card className="p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Score</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Change</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-6 py-4">
                                        <div className="h-6 bg-gray-50 rounded w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : entries.map((entry) => (
                            <tr key={entry.address} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                            entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                    'text-gray-500'
                                        }`}>
                                        {entry.rank}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {entry.address.substring(2, 4)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{entry.displayName || entry.address.substring(0, 10)}...</p>
                                            {entry.badge && <span className="text-lg">{entry.badge}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-extrabold text-gray-900">{formatNumber(entry.score)}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`text-xs font-bold ${entry.change > 0 ? 'text-green-600' :
                                            entry.change < 0 ? 'text-red-600' : 'text-gray-400'
                                        }`}>
                                        {entry.change > 0 ? '+' : ''}{entry.change}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
