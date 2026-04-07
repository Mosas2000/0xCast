/**
 * Time Range Selector Component
 * 
 * Toggle buttons for selecting analytics time range
 */

import type { TimeRange } from '../types/analytics';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  options?: TimeRange[];
  size?: 'sm' | 'md';
}

const defaultOptions: TimeRange[] = ['24h', '7d', '30d', '90d', 'all'];

const labels: Record<TimeRange, string> = {
  '24h': '24H',
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  'all': 'All',
};

export function TimeRangeSelector({
  value,
  onChange,
  options = defaultOptions,
  size = 'md',
}: TimeRangeSelectorProps) {
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <div className="inline-flex bg-neutral-900 rounded-lg border border-neutral-800 p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`${sizeStyles[size]} font-medium rounded-md transition-colors ${
            value === option
              ? 'bg-blue-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

// Dropdown version for mobile
interface TimeRangeDropdownProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  options?: TimeRange[];
}

export function TimeRangeDropdown({
  value,
  onChange,
  options = defaultOptions,
}: TimeRangeDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TimeRange)}
      className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  );
}
