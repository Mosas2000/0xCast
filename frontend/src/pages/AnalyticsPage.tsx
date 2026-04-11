/**
 * Analytics Page
 * 
 * Dashboard displaying platform statistics and market insights
 */

import { useAnalytics } from '../hooks/useAnalytics';
import { useWallet } from '../components/WalletProvider';
import { StatsCard, StatsGrid } from '../components/StatsCard';
import { VolumeChart, CategoryPieChart, ActivityChart } from '../components/charts';
import { TopMarketsTable, TopMarketCard } from '../components/TopMarketsTable';
import { TimeRangeSelector, TimeRangeDropdown } from '../components/TimeRangeSelector';
import { PersonalStatsCard } from '../components/PersonalStatsCard';
import { LoadingState } from '../components/Loading';

export function AnalyticsPage() {
  const { isConnected } = useWallet();
  const {
    platformStats,
    topMarkets,
    volumeHistory,
    categoryDistribution,
    userActivity,
    personalStats,
    marketHealth,
    predictiveInsights,
    isLoading,
    timeRange,
    setTimeRange,
    refresh,
  } = useAnalytics();

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-neutral-400">Platform statistics and market insights</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile dropdown */}
            <div className="sm:hidden">
              <TimeRangeDropdown value={timeRange} onChange={setTimeRange} />
            </div>
            {/* Desktop buttons */}
            <div className="hidden sm:block">
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>
            <button 
              onClick={refresh}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
              title="Refresh data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading analytics..." />
        ) : (
          <div className="space-y-8">
            {/* Platform Stats */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Platform Overview</h2>
              <StatsGrid columns={4}>
                <StatsCard
                  title="Total Markets"
                  value={platformStats?.totalMarkets || 0}
                  subtitle={`${platformStats?.activeMarkets || 0} active`}
                  color="blue"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Total Volume"
                  value={`${platformStats?.totalVolumeFormatted || '0'} STX`}
                  subtitle="All time"
                  color="green"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Total Predictions"
                  value={platformStats?.totalPredictions || 0}
                  subtitle={`~${platformStats?.totalUsers || 0} users`}
                  color="purple"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Fees Collected"
                  value={`${platformStats?.totalFeesFormatted || '0'} STX`}
                  subtitle="2% protocol fee"
                  color="amber"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
              </StatsGrid>
            </section>

            {/* Charts Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Volume Chart */}
              <div className="lg:col-span-2 bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Volume Trend</h3>
                <VolumeChart data={volumeHistory} height={280} />
              </div>
              
              {/* Category Distribution */}
              <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                <CategoryPieChart 
                  data={categoryDistribution} 
                  height={280}
                  innerRadius={50}
                  outerRadius={80}
                />
              </div>
            </section>

            {/* Activity and Personal Stats */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Chart */}
              <div className="lg:col-span-2 bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">User Activity</h3>
                <ActivityChart data={userActivity} height={280} />
              </div>
              
              {/* Personal Stats */}
              <div>
                <PersonalStatsCard stats={personalStats} isConnected={isConnected} />
              </div>
            </section>

            {/* Top Markets */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Top Markets by Volume</h2>
                <a href="/markets" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View all markets
                </a>
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block">
                <TopMarketsTable markets={topMarkets} maxRows={5} />
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {topMarkets.slice(0, 5).map((market, index) => (
                  <TopMarketCard key={market.id} market={market} rank={index + 1} />
                ))}
              </div>
            </section>

            {/* Market Health and Predictive Insights */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Market Health</h3>
                {!marketHealth ? (
                  <p className="text-neutral-500">No market health data available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Active Rate</p>
                      <p className="text-white font-semibold">{marketHealth.activeRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Resolved Rate</p>
                      <p className="text-white font-semibold">{marketHealth.resolvedRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Average Pool</p>
                      <p className="text-white font-semibold">{marketHealth.averagePoolFormatted} STX</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Median Pool</p>
                      <p className="text-white font-semibold">{marketHealth.medianPoolFormatted} STX</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Largest Pool</p>
                      <p className="text-white font-semibold">{marketHealth.largestPoolFormatted} STX</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Top 3 Concentration</p>
                      <p className="text-white font-semibold">{marketHealth.concentrationTop3.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Predictive Insights</h3>
                {predictiveInsights.length === 0 ? (
                  <p className="text-neutral-500">No predictive insights available</p>
                ) : (
                  <div className="space-y-3">
                    {predictiveInsights.map((insight) => (
                      <div key={insight.marketId} className="border border-neutral-800 rounded-lg p-3">
                        <p className="text-sm text-white line-clamp-1">{insight.question}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                          <span>Projected winner: <span className="text-neutral-200">{insight.projectedWinner.toUpperCase()}</span></span>
                          <span>Confidence: <span className="text-neutral-200">{insight.confidence.toFixed(1)}%</span></span>
                          <span>Projected pool: <span className="text-neutral-200">{insight.projectedFinalPoolFormatted} STX</span></span>
                          <span>Risk: <span className="text-neutral-200">{insight.risk.toUpperCase()}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
