/**
 * Activity Chart Component
 * 
 * Bar chart showing daily user activity
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { UserActivityData } from '../../types/analytics';
import { CHART_COLORS } from '../../types/analytics';

interface ActivityChartProps {
  data: UserActivityData[];
  height?: number;
  showLegend?: boolean;
}

export function ActivityChart({
  data,
  height = 300,
  showLegend = true,
}: ActivityChartProps) {
  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-neutral-900/50 rounded-xl border border-neutral-800"
        style={{ height }}
      >
        <p className="text-neutral-500">No activity data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-neutral-400 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.primary }} />
              <span className="text-sm text-white">
                Active Users: {payload[0]?.value || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS.secondary }} />
              <span className="text-sm text-white">
                Transactions: {payload[1]?.value || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    const labels: Record<string, string> = {
      activeUsers: 'Active Users',
      transactions: 'Transactions',
    };
    
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-neutral-400">
              {labels[entry.dataKey] || entry.dataKey}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            vertical={false}
          />
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
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          {showLegend && <Legend content={<CustomLegend />} />}
          <Bar
            dataKey="activeUsers"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="transactions"
            fill={CHART_COLORS.secondary}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
