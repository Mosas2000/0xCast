import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { formatStx } from '@/utils/helpers';

type LeaderboardTab = 'win-rate' | 'volume' | 'weekly' | 'monthly';

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('win-rate');
  const { byWinRate, byVolume, weeklyRanking, monthlyRanking, isLoading, error, lastRefresh } =
    useLeaderboard();

  const getActiveData = () => {
    switch (activeTab) {
      case 'win-rate':
        return byWinRate;
      case 'volume':
        return byVolume;
      case 'weekly':
        return weeklyRanking;
      case 'monthly':
        return monthlyRanking;
    }
  };

  const activeData = getActiveData();
  const tabs: { id: LeaderboardTab; label: string; icon: string }[] = [
    { id: 'win-rate', label: 'Top Traders', icon: '🎯' },
    { id: 'volume', label: 'High Volume', icon: '📈' },
    { id: 'weekly', label: 'Weekly', icon: '📅' },
    { id: 'monthly', label: 'Monthly', icon: '📆' },
  ];

  return (
    <div style={{ paddingTop: 72 }} className="min-h-screen bg-white dark:bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Top prediction traders and performance rankings
          </p>
          {lastRefresh && (
            <p className="text-xs text-neutral-500 dark:text-neutral-600 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Leaderboard Table */}
        {!isLoading && activeData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead>
                <tr className="border-b border-neutral-300 dark:border-neutral-800">
                  <th className="text-left py-4 px-4 font-semibold text-black dark:text-white">
                    Rank
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-black dark:text-white">
                    Trader
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-black dark:text-white">
                    Win Rate
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-black dark:text-white">
                    Record
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-black dark:text-white">
                    Total Volume
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {activeData.map((entry) => (
                  <tr
                    key={entry.address}
                    className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        {entry.rank <= 3 ? (
                          <span
                            className={`text-2xl font-bold ${
                              entry.rank === 1
                                ? '🥇'
                                : entry.rank === 2
                                ? '🥈'
                                : '🥉'
                            }`}
                          />
                        ) : (
                          <span className="font-bold text-black dark:text-white">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trader Name/Address */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-black dark:text-white">
                          {entry.displayName || 'Anonymous Trader'}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-500 font-mono">
                          {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                        </span>
                      </div>
                    </td>

                    {/* Win Rate */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {entry.winRate.toFixed(1)}%
                        </span>
                        <div className="w-24 h-2 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${entry.winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Record */}
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm text-black dark:text-white">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {entry.wins}W
                        </span>
                        {' - '}
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {entry.losses}L
                        </span>
                      </div>
                    </td>

                    {/* Total Volume */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatStx(entry.totalVolume)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && activeData.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              No leaderboard data yet
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Come back soon as traders place more predictions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
