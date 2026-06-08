/**
 * Stats Card Component
 * 
 * Display a single statistic with label and optional trend
 */

import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500',
    icon: 'text-blue-400',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-500',
    icon: 'text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-500',
    icon: 'text-amber-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-500',
    icon: 'text-red-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-500',
    icon: 'text-purple-400',
  },
  neutral: {
    bg: 'bg-neutral-800',
    border: 'border-neutral-700',
    text: 'text-white',
    icon: 'text-neutral-400',
  },
};

const sizeStyles = {
  sm: {
    card: 'p-4',
    title: 'text-xs',
    value: 'text-xl',
    subtitle: 'text-xs',
    icon: 'w-8 h-8',
  },
  md: {
    card: 'p-5',
    title: 'text-sm',
    value: 'text-2xl',
    subtitle: 'text-sm',
    icon: 'w-10 h-10',
  },
  lg: {
    card: 'p-6',
    title: 'text-sm',
    value: 'text-3xl',
    subtitle: 'text-sm',
    icon: 'w-12 h-12',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'neutral',
  size = 'md',
  className = '',
}: StatsCardProps) {
  const colors = colorStyles[color];
  const sizes = sizeStyles[size];

  return (
    <div
      className={`rounded-xl border ${colors.bg} ${colors.border} ${sizes.card} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${sizes.title} text-neutral-400 font-medium mb-1`}>
            {title}
          </p>
          <p className={`${sizes.value} font-bold ${colors.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`${sizes.subtitle} text-neutral-500 mt-1`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-neutral-500">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`${sizes.icon} flex items-center justify-center rounded-lg ${colors.bg} ${colors.icon}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Grid wrapper for stats cards
interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className = '' }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
