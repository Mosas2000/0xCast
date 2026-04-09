/**
 * Personal Stats Card Component
 * 
 * Display user's personal analytics when connected
 */

import type { PersonalStats } from '../types/analytics';

interface PersonalStatsCardProps {
  stats: PersonalStats | null;
  isConnected: boolean;
}

export function PersonalStatsCard({ stats, isConnected }: PersonalStatsCardProps) {
  if (!isConnected) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-xl border border-neutral-300 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Your Performance</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-neutral-300 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-neutral-600 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Connect your wallet to see your analytics</p>
          <button className="btn btn-primary btn-sm">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-xl border border-neutral-300 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Your Performance</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-300 dark:bg-neutral-800 rounded w-1/2" />
          <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-3/4" />
          <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  const pnlColor = stats.netPnL >= 0n ? 'text-emerald-500' : 'text-red-500';
  const pnlBgColor = stats.netPnL >= 0n ? 'bg-emerald-500/10' : 'bg-red-500/10';

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-xl border border-neutral-300 dark:border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-black dark:text-white">Your Performance</h3>
        {stats.favoriteCategory && (
          <span className="text-xs text-neutral-600 dark:text-neutral-500 bg-neutral-300 dark:bg-neutral-800 px-2 py-1 rounded">
            Favorite: {stats.favoriteCategory}
          </span>
        )}
      </div>

      {/* P&L Section */}
      <div className={`${pnlBgColor} rounded-xl p-4 mb-6`}>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Net P&L</p>
        <p className={`text-3xl font-bold ${pnlColor}`}>
          {stats.netPnL >= 0n ? '+' : ''}{stats.netPnLFormatted} STX
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-1">Total Staked</p>
          <p className="text-lg font-medium text-black dark:text-white">{stats.totalStakedFormatted} STX</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-1">Total Winnings</p>
          <p className="text-lg font-medium text-emerald-400">{stats.totalWinningsFormatted} STX</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-1">Total Losses</p>
          <p className="text-lg font-medium text-red-400">{stats.totalLossesFormatted} STX</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-1">Predictions</p>
          <p className="text-lg font-medium text-black dark:text-white">{stats.totalPredictions}</p>
        </div>
      </div>

      {/* Win/Loss Ratio */}
      <div className="border-t border-neutral-300 dark:border-neutral-800 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Win Rate</span>
          <span className="text-sm font-medium text-black dark:text-white">{stats.winRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-neutral-300 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.winRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-600 dark:text-neutral-500">
          <span>{stats.wins} wins</span>
          <span>{stats.losses} losses</span>
        </div>
      </div>

      {/* Pending Positions */}
      {stats.pendingPositions > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Pending Positions</span>
            <span className="text-sm font-medium text-amber-400">{stats.pendingPositions}</span>
          </div>
        </div>
      )}
    </div>
  );
}
