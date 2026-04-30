/**
 * Leaderboard Component
 * 
 * Display user rankings and statistics
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboardService, type LeaderboardSortBy } from '../services/LeaderboardService';

interface LeaderboardComponentProps {
  limit?: number;
  sortBy?: LeaderboardSortBy;
  showStats?: boolean;
  compact?: boolean;
}

export function LeaderboardComponent({
  limit = 10,
  sortBy = 'winRate',
  showStats = true,
  compact = false,
}: LeaderboardComponentProps) {
  const leaderboardService = getLeaderboardService();
  const [selectedSort, setSelectedSort] = useState<LeaderboardSortBy>(sortBy);

  const leaderboard = useMemo(() => {
    return leaderboardService.getLeaderboard(selectedSort, limit);
  }, [leaderboardService, selectedSort, limit]);

  const stats = useMemo(() => {
    return leaderboardService.getStats(selectedSort);
  }, [leaderboardService, selectedSort]);

  if (leaderboard.length === 0) {
    return (
      <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-8 text-center">
        <p className="text-neutral-500">No leaderboard data available</p>
      </div>
    );
  }

  const sortOptions: { value: LeaderboardSortBy; label: string }[] = [
    { value: 'winRate', label: 'Win Rate' },
    { value: 'netPnL', label: 'Net P&L' },
    { value: 'predictions', label: 'Predictions' },
    { value: 'totalStaked', label: 'Total Staked' },
    { value: 'lastActive', label: 'Last Active' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with sort options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Top Predictors</h2>
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedSort(option.value)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                selectedSort === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {showStats && stats.topEntry && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">Total Entries</p>
            <p className="text-lg font-semibold text-white">{stats.totalEntries}</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">Avg Win Rate</p>
            <p className="text-lg font-semibold text-white">{stats.averageWinRate.toFixed(1)}%</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">Avg Staked</p>
            <p className="text-lg font-semibold text-white">{(stats.averageStaked / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-500 mb-1">Median P&L</p>
            <p className={`text-lg font-semibold ${stats.medianNetPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.medianNetPnL >= 0 ? '+' : ''}{(stats.medianNetPnL / 1000).toFixed(1)}K
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                {!compact && (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Predictions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Win Rate
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Staked
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Net P&L
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {leaderboard.map((entry) => (
                <tr key={entry.userId} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      {entry.rank <= 3 ? (
                        <span className={`text-sm font-bold ${
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-400' :
                          'text-orange-400'
                        }`}>
                          {'🥇🥈🥉'[entry.rank - 1]}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-neutral-400">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{entry.username}</p>
                        <p className="text-xs text-neutral-500">{entry.walletAddress.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  {!compact && (
                    <>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-neutral-300">{entry.predictions}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-medium text-emerald-400">
                          {entry.winRate.toFixed(1)}%
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm text-neutral-300">
                      {(entry.totalStaked / 1000).toFixed(1)}K STX
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-sm font-medium ${entry.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.netPnL >= 0 ? '+' : ''}{(entry.netPnL / 1000).toFixed(1)}K
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Compact card version for mobile
interface LeaderboardCardProps {
  entry: ReturnType<typeof getLeaderboardService>['getLeaderboard'][0];
}

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  return (
    <Link
      to={`/user/${entry.userId}`}
      className="block bg-neutral-900/50 rounded-xl border border-neutral-800 p-4 hover:border-neutral-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {entry.rank <= 3 ? (
            <span className={`text-2xl ${
              entry.rank === 1 ? 'text-yellow-400' :
              entry.rank === 2 ? 'text-gray-400' :
              'text-orange-400'
            }`}>
              {'🥇🥈🥉'[entry.rank - 1]}
            </span>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-neutral-800 rounded-full text-xs font-medium text-neutral-400">
              {entry.rank}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{entry.username}</p>
          <p className="text-xs text-neutral-500 mb-2">{entry.walletAddress.slice(0, 12)}...</p>
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>{entry.predictions} predictions</span>
            <span className="text-emerald-400">{entry.winRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-neutral-500">P&L:</span>
            <span className={entry.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {entry.netPnL >= 0 ? '+' : ''}{(entry.netPnL / 1000).toFixed(1)}K
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
