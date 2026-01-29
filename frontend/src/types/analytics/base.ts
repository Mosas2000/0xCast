export interface TimeSeriesDataPoint {
    timestamp: number;
    value: number;
    label?: string;
}

export interface MetricValue {
    current: number;
    previous?: number;
    change?: number;
    changePercent?: number;
    trend: 'up' | 'down' | 'neutral';
}

export interface DateRange {
    start: number;
    end: number;
    label: string;
}
