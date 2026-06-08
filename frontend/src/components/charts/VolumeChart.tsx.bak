/**
 * Volume Chart Component
 * 
 * Line/Area chart showing trading volume over time
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from 'recharts';
import type { VolumeDataPoint } from '../../types/analytics';
import { CHART_COLORS } from '../../types/analytics';

function CustomTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as VolumeDataPoint;
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-neutral-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-white">
          {data.volumeFormatted} STX
        </p>
        <p className="text-xs text-neutral-500">
          {data.transactions} transactions
        </p>
      </div>
    );
  }
  return null;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  height?: number;
  showGrid?: boolean;
  gradient?: boolean;
}

export function VolumeChart({
  data,
  height = 300,
  showGrid = true,
  gradient = true,
}: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-900/50 rounded-xl border border-neutral-300 dark:border-neutral-800"
        style={{ height }}
      >
        <p className="text-neutral-600 dark:text-neutral-500">No volume data available</p>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {gradient && (
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            width={50}
          />
          <Tooltip content={CustomTooltip} />
          <Area
            type="monotone"
            dataKey="volume"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill={gradient ? 'url(#volumeGradient)' : CHART_COLORS.primary}
            fillOpacity={gradient ? 1 : 0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
