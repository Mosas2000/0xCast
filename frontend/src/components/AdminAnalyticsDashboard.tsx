/**
 * Admin Analytics Dashboard Component
 * 
 * Comprehensive analytics dashboard for platform administrators
 * Shows user behavior, market trends, revenue metrics, and leaderboards
 */

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatsCard, StatsGrid } from './StatsCard';
import { VolumeChart, CategoryPieChart, ActivityChart } from './charts';
import { TimeRangeSelector, TimeRangeDropdown } from './TimeRangeSelector';
import { LoadingState } from './Loading';
import type { TimeRange } from '../types/analytics';

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  userRetention: number;
  churnRate: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  predictions: number;
  winRate: number;
  totalStaked: number;
  netPnL: number;
}

export function AdminAnalyticsDashboard() {
  const {
    platformStats,
    topMarkets,
    volumeHistory,
    categoryDistribution,
    userActivity,
    marketHealth,
    predictiveInsights,
    isLoading,
    timeRange,
    setTimeRange,
  } = useAnalytics();

  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'revenue' | 'leaderboard'>('overview');

  // Mock admin metrics calculation
  useEffect(() => {
    if (platformStats) {
      setAdminMetrics({
        totalUsers: platformStats.totalUsers,
        activeUsers: Math.floor(platformStats.totalUsers * 0.65),
        newUsers: Math.floor(platformStats.totalUsers * 0.12),
        totalRevenue: Number(platformStats.totalFeesCollected),
        averageOrderValue: platformStats.totalUsers > 0 ? Number(platformStats.totalFeesCollected) / platformStats.totalUsers : 0,
        conversionRate: 3.2,
        userRetention: 78.5,
        churnRate: 2.1,
      });

      // Mock leaderboard data
      setLeaderboard([
        {
          rank: 1,
          userId: 'user_001',
          username: 'PredictionMaster',
          predictions: 156,
          winRate: 72.4,
          totalStaked: 45000,
          netPnL: 12500,
        },
        {
          rank: 2,
          userId: 'user_002',
          username: 'CryptoGuru',
          predictions: 142,
          winRate: 68.3,
          totalStaked: 38000,
          netPnL: 9800,
        },
        {
          rank: 3,
          userId: 'user_003',
          username: 'MarketWizard',
          predictions: 128,
          winRate: 65.6,
          totalStaked: 32000,
          netPnL: 7200,
        },
        {
          rank: 4,
          userId: 'user_004',
          username: 'DataAnalyst',
          predictions: 115,
          winRate: 62.1,
          totalStaked: 28000,
          netPnL: 5100,
        },
        {
          rank: 5,
          userId: 'user_005',
          username: 'TrendSpotter',
          predictions: 98,
          winRate: 58.9,
          totalStaked: 22000,
          netPnL: 2800,
        },
      ]);
    }
  }, [platformStats]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'User Behavior' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ] as const;

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Analytics</h1>
            <p className="text-neutral-400">Platform metrics and user insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="sm:hidden">
              <TimeRangeDropdown value={timeRange} onChange={setTimeRange} />
            </div>
            <div className="hidden sm:block">
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-neutral-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState message="Loading analytics..." />
        ) : (
          <>
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Key Metrics</h2>
                  <StatsGrid columns={4}>
                    <StatsCard
                      title="Total Markets"
                      value={platformStats?.totalMarkets || 0}
                      subtitle={`${platformStats?.activeMarkets || 0} active`}
                      color="blue"
                    />
                    <StatsCard
                      title="Total Volume"
                      value={`${platformStats?.totalVolumeFormatted || '0'} STX`}
                      subtitle="All time"
                      color="green"
                    />
                    <StatsCard
                      title="Total Predictions"
                      value={platformStats?.totalPredictions || 0}
                      subtitle={`~${platformStats?.totalUsers || 0} users`}
                      color="purple"
                    />
                    <StatsCard
                      title="Fees Collected"
                      value={`${platformStats?.totalFeesFormatted || '0'} STX`}
                      subtitle="2% protocol fee"
                      color="amber"
                    />
                  </StatsGrid>
                </section>

                {/* Charts */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Volume Trend</h3>
                    <VolumeChart data={volumeHistory} height={280} />
                  </div>
                  <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                    <CategoryPieChart data={categoryDistribution} height={280} />
                  </div>
                </section>

                {/* Activity */}
                <section className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">User Activity</h3>
                  <ActivityChart data={userActivity} height={280} />
                </section>
              </div>
            )}

            {/* User Behavior Tab */}
            {selectedTab === 'users' && adminMetrics && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">User Metrics</h2>
                  <StatsGrid columns={4}>
                    <StatsCard
                      title="Total Users"
                      value={adminMetrics.totalUsers}
                      subtitle="All time"
                      color="blue"
                    />
                    <StatsCard
                      title="Active Users"
                      value={adminMetrics.activeUsers}
                      subtitle={`${((adminMetrics.activeUsers / adminMetrics.totalUsers) * 100).toFixed(1)}% of total`}
                      color="green"
                    />
                    <StatsCard
                      title="New Users"
                      value={adminMetrics.newUsers}
                      subtitle={`${((adminMetrics.newUsers / adminMetrics.totalUsers) * 100).toFixed(1)}% growth`}
                      color="purple"
                    />
                    <StatsCard
                      title="Retention Rate"
                      value={`${adminMetrics.userRetention.toFixed(1)}%`}
                      subtitle={`Churn: ${adminMetrics.churnRate.toFixed(1)}%`}
                      color="amber"
                    />
                  </StatsGrid>
                </section>

                <section className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">User Behavior Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-3">Conversion Funnel</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Visitors</span>
                            <span className="text-neutral-400">100%</span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded h-2">
                            <div className="bg-blue-500 h-2 rounded" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Signed Up</span>
                            <span className="text-neutral-400">45%</span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded h-2">
                            <div className="bg-green-500 h-2 rounded" style={{ width: '45%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Made Prediction</span>
                            <span className="text-neutral-400">32%</span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded h-2">
                            <div className="bg-purple-500 h-2 rounded" style={{ width: '32%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-3">User Segments</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Casual Users</span>
                          <span className="text-neutral-400">45%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Regular Traders</span>
                          <span className="text-neutral-400">35%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Power Users</span>
                          <span className="text-neutral-400">15%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Inactive</span>
                          <span className="text-neutral-400">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Revenue Tab */}
            {selectedTab === 'revenue' && adminMetrics && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Revenue Metrics</h2>
                  <StatsGrid columns={4}>
                    <StatsCard
                      title="Total Revenue"
                      value={`${adminMetrics.totalRevenue.toFixed(2)} STX`}
                      subtitle="All time"
                      color="green"
                    />
                    <StatsCard
                      title="Average Order Value"
                      value={`${adminMetrics.averageOrderValue.toFixed(4)} STX`}
                      subtitle="Per transaction"
                      color="blue"
                    />
                    <StatsCard
                      title="Conversion Rate"
                      value={`${adminMetrics.conversionRate.toFixed(2)}%`}
                      subtitle="Visitor to trader"
                      color="purple"
                    />
                    <StatsCard
                      title="Revenue per User"
                      value={`${(adminMetrics.totalRevenue / adminMetrics.totalUsers).toFixed(4)} STX`}
                      subtitle="Average"
                      color="amber"
                    />
                  </StatsGrid>
                </section>

                <section className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-3">By Market Category</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Crypto</span>
                          <span className="text-green-400">35%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Sports</span>
                          <span className="text-green-400">25%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Politics</span>
                          <span className="text-green-400">20%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Other</span>
                          <span className="text-green-400">20%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-3">By User Segment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Power Users</span>
                          <span className="text-green-400">60%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Regular Traders</span>
                          <span className="text-green-400">30%</span>
                        </div>
                        <div className="flex justify-between p-2 bg-neutral-800/50 rounded">
                          <span className="text-white">Casual Users</span>
                          <span className="text-green-400">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Leaderboard Tab */}
            {selectedTab === 'leaderboard' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Top Predictors</h2>
                  <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-800">
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-12">
                              Rank
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Username
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Predictions
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Win Rate
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Total Staked
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
                                <span className="text-sm font-medium text-neutral-400">
                                  {entry.rank}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-white">{entry.username}</span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-sm text-neutral-300">{entry.predictions}</span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-sm font-medium text-emerald-400">
                                  {entry.winRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-sm text-neutral-300">
                                  {entry.totalStaked.toLocaleString()} STX
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className={`text-sm font-medium ${entry.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {entry.netPnL >= 0 ? '+' : ''}{entry.netPnL.toLocaleString()} STX
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
