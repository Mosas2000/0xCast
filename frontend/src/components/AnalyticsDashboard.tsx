import React, { useReducer, useEffect, memo } from 'react';
import { TradingAnalytics, TradeMetrics } from '@/services/TradingAnalytics';
import { PriceMonitor } from '@/services/PriceMonitor';
import { AMMPool } from '@/types/amm';

interface AnalyticsDashboardProps {
  userId: string;
  analytics: TradingAnalytics;
  priceMonitor: PriceMonitor;
  pools: AMMPool[];
}

interface AnalyticsState {
  metrics: TradeMetrics | null;
  pnl: number;
  roi: number;
  successRate: number;
}

type AnalyticsAction =
  | { type: 'SET_METRICS'; payload: TradeMetrics }
  | { type: 'SET_PNL'; payload: number }
  | { type: 'SET_ROI'; payload: number }
  | { type: 'SET_SUCCESS_RATE'; payload: number }
  | { type: 'UPDATE_ALL'; payload: Omit<AnalyticsState, 'metrics'> & { metrics: TradeMetrics } };

const initialState: AnalyticsState = {
  metrics: null,
  pnl: 0,
  roi: 0,
  successRate: 0,
};

interface TradeRowProps {
  trade: any;
}

const TradeRow = memo(({ trade }: TradeRowProps) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="py-2">{trade.poolId}</td>
    <td className="text-right font-mono">
      {(Number(trade.amountIn) / 1e12).toFixed(4)}
    </td>
    <td className="text-right font-mono">
      {(Number(trade.amountOut) / 1e12).toFixed(4)}
    </td>
    <td className="text-right">{trade.slippage.toFixed(3)}%</td>
    <td className="text-right">
      <span
        className={
          trade.profitable
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold'
        }
      >
        {trade.profitable ? 'Win' : 'Loss'}
      </span>
    </td>
  </tr>
));

interface PoolStatRowProps {
  stat: any;
}

const PoolStatRow = memo(({ stat }: PoolStatRowProps) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="py-2">{stat.poolId}</td>
    <td className="text-right">{stat.trades}</td>
    <td className="text-right">{stat.winRate.toFixed(1)}%</td>
    <td className="text-right font-mono">
      {(Number(stat.volume) / 1e12).toFixed(2)}
    </td>
  </tr>
));

function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_PNL':
      return { ...state, pnl: action.payload };
    case 'SET_ROI':
      return { ...state, roi: action.payload };
    case 'SET_SUCCESS_RATE':
      return { ...state, successRate: action.payload };
    case 'UPDATE_ALL':
      return action.payload;
    default:
      return state;
  }
}

export function AnalyticsDashboard({
  userId,
  analytics,
  priceMonitor,
  pools,
}: AnalyticsDashboardProps) {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  useEffect(() => {
    const m = analytics.getUserMetrics(userId);
    const calculatedPnl = analytics.calculatePnL(userId);
    const calculatedRoi = analytics.calculateROI(userId);
    const calculatedSuccessRate = analytics.calculateSuccessRate(userId);

    dispatch({
      type: 'UPDATE_ALL',
      payload: {
        metrics: m,
        pnl: calculatedPnl,
        roi: calculatedRoi,
        successRate: calculatedSuccessRate,
      },
    });
  }, [userId, analytics]);

  if (!state.metrics) {
    return <div className="p-4">No trading data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Trades"
          value={state.metrics.totalTrades}
          format="number"
        />
        <MetricCard
          title="Win Rate"
          value={state.successRate}
          format="percent"
          color={state.successRate > 50 ? 'green' : 'red'}
        />
        <MetricCard
          title="P&L"
          value={state.pnl}
          format="number"
          color={state.pnl > 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="ROI"
          value={state.roi}
          format="percent"
          color={state.roi > 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PerformanceChart metrics={state.metrics} />
        <VolumeChart metrics={state.metrics} />
      </div>

      <TradeHistoryTable userId={userId} analytics={analytics} />
      <PoolPerformanceTable pools={pools} analytics={analytics} userId={userId} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  format: 'number' | 'percent';
  color?: 'green' | 'red' | 'default';
}

function MetricCard({ title, value, format, color = 'default' }: MetricCardProps) {
  let colorClass = '';
  if (color === 'green') colorClass = 'text-green-600';
  if (color === 'red') colorClass = 'text-red-600';

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>
        {format === 'percent'
          ? `${value.toFixed(2)}%`
          : value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

interface PerformanceChartProps {
  metrics: TradeMetrics;
}

function PerformanceChart({ metrics }: PerformanceChartProps) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Trade Performance</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Profitable</span>
            <span>{metrics.profitableTrades}</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-green-600 h-2 rounded"
              style={{
                width: `${(metrics.profitableTrades / metrics.totalTrades) * 100}%`,
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Losses</span>
            <span>{metrics.lossTrades}</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-red-600 h-2 rounded"
              style={{
                width: `${(metrics.lossTrades / metrics.totalTrades) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface VolumeChartProps {
  metrics: TradeMetrics;
}

function VolumeChart({ metrics }: VolumeChartProps) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Trading Volume</h3>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Volume</div>
          <div className="text-xl font-semibold">
            {(Number(metrics.totalVolume) / 1e12).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Fees Paid</div>
          <div className="text-xl font-semibold">
            {(Number(metrics.totalFees) / 1e12).toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Average Slippage</div>
          <div className="text-xl font-semibold">
            {metrics.averageSlippage.toFixed(3)}%
          </div>
        </div>
      </div>
    </div>
  );
}

interface TradeHistoryTableProps {
  userId: string;
  analytics: TradingAnalytics;
}

function TradeHistoryTable({ userId, analytics }: TradeHistoryTableProps) {
  const trades = analytics.getUserTrades(userId).slice(-10);

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Recent Trades</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Pool</th>
              <th className="text-right py-2">Amount In</th>
              <th className="text-right py-2">Amount Out</th>
              <th className="text-right py-2">Slippage</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface PoolPerformanceTableProps {
  pools: AMMPool[];
  analytics: TradingAnalytics;
  userId: string;
}

function PoolPerformanceTable({
  pools,
  analytics,
  userId,
}: PoolPerformanceTableProps) {
  const userTrades = analytics.getUserTrades(userId);
  const poolStats = pools.map(pool => {
    const trades = userTrades.filter(t => t.poolId === pool.id);
    const profitableTrades = trades.filter(t => t.profitable).length;
    const totalVolume = trades.reduce((sum, t) => sum + t.amountIn, 0n);

    return {
      poolId: pool.id,
      trades: trades.length,
      winRate: trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0,
      volume: totalVolume,
    };
  });

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Pool Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Pool</th>
              <th className="text-right py-2">Trades</th>
              <th className="text-right py-2">Win Rate</th>
              <th className="text-right py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {poolStats
              .filter(s => s.trades > 0)
              .sort((a, b) => b.trades - a.trades)
              .map(stat => (
                <PoolStatRow key={stat.poolId} stat={stat} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
