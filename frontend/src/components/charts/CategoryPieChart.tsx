/**
 * Category Pie Chart Component
 * 
 * Pie chart showing market distribution by category
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CategoryData } from '../../types/analytics';

interface CategoryPieChartProps {
  data: CategoryData[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function CategoryPieChart({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
}: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-900/50 rounded-xl border border-neutral-300 dark:border-neutral-800"
        style={{ height }}
      >
        <p className="text-neutral-600 dark:text-neutral-500">No category data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-sm font-medium text-white">{data.name}</span>
          </div>
          <p className="text-lg font-bold text-white">
            {data.value.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500">
            {data.count} market{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-neutral-400">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini version for compact displays
interface MiniPieChartProps {
  data: CategoryData[];
  size?: number;
}

export function MiniPieChart({ data, size = 80 }: MiniPieChartProps) {
  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-neutral-800 rounded-full"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-neutral-500">N/A</span>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.45}
            paddingAngle={1}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
