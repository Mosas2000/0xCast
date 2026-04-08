/**
 * Market Distribution Chart Component
 * 
 * Stacked bar chart showing Yes/No distribution per market
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MarketStats } from '../../types/analytics';
import { CHART_COLORS } from '../../types/analytics';

interface MarketDistributionChartProps {
  data: MarketStats[];
  height?: number;
  maxMarkets?: number;
}

export function MarketDistributionChart({
  data,
  height = 300,
  maxMarkets = 10,
}: MarketDistributionChartProps) {
  // Take top N markets by pool size
  const chartData = data
    .slice(0, maxMarkets)
    .map((market) => ({
      name: market.question.length > 20 
        ? market.question.substring(0, 20) + '...' 
        : market.question,
      fullQuestion: market.question,
      yes: market.yesPercentage,
      no: market.noPercentage,
      totalPool: market.totalPoolFormatted,
      predictors: market.predictorCount,
    }));

  if (chartData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-neutral-900/50 rounded-xl border border-neutral-800"
        style={{ height }}
      >
        <p className="text-neutral-500">No market data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl max-w-xs">
          <p className="text-sm text-white font-medium mb-2 line-clamp-2">
            {data.fullQuestion}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-400 text-sm">Yes:</span>
              <span className="text-white text-sm font-medium">{data.yes.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400 text-sm">No:</span>
              <span className="text-white text-sm font-medium">{data.no.toFixed(1)}%</span>
            </div>
            <div className="border-t border-neutral-700 pt-1 mt-1">
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Pool:</span>
                <span className="text-neutral-300 text-xs">{data.totalPool} STX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Predictors:</span>
                <span className="text-neutral-300 text-xs">{data.predictors}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar
            dataKey="yes"
            stackId="distribution"
            fill={CHART_COLORS.secondary}
            radius={[4, 0, 0, 4]}
          />
          <Bar
            dataKey="no"
            stackId="distribution"
            fill={CHART_COLORS.quaternary}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simple horizontal bar for single market
interface MarketBarProps {
  yesPercentage: number;
  noPercentage: number;
  showLabels?: boolean;
  height?: number;
}

export function MarketBar({ 
  yesPercentage, 
  noPercentage, 
  showLabels = true,
  height = 8 
}: MarketBarProps) {
  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-emerald-400">Yes {yesPercentage.toFixed(1)}%</span>
          <span className="text-red-400">No {noPercentage.toFixed(1)}%</span>
        </div>
      )}
      <div 
        className="w-full bg-neutral-800 rounded-full overflow-hidden flex"
        style={{ height }}
      >
        <div 
          className="bg-emerald-500 transition-all duration-300"
          style={{ width: `${yesPercentage}%` }}
        />
        <div 
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${noPercentage}%` }}
        />
      </div>
    </div>
  );
}
