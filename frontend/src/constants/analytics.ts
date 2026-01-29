export const TIME_RANGES = {
    '1H': { label: 'Last Hour', ms: 60 * 60 * 1000 },
    '24H': { label: 'Last 24 Hours', ms: 24 * 60 * 60 * 1000 },
    '7D': { label: 'Last 7 Days', ms: 7 * 24 * 60 * 60 * 1000 },
    '30D': { label: 'Last 30 Days', ms: 30 * 24 * 60 * 60 * 1000 },
    '90D': { label: 'Last 90 Days', ms: 90 * 24 * 60 * 60 * 1000 },
    'ALL': { label: 'All Time', ms: Infinity }
} as const;

export const CHART_COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    gray: '#6b7280'
} as const;

export const METRIC_FORMATS = {
    currency: { prefix: '$', decimals: 2 },
    percentage: { suffix: '%', decimals: 1 },
    number: { decimals: 0 },
    stx: { suffix: ' STX', decimals: 2 }
} as const;
