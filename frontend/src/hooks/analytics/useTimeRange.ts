import { useState } from 'react';
import { TIME_RANGES } from '../../constants/analytics';

export type TimeRangeKey = keyof typeof TIME_RANGES;

export function useTimeRange(defaultRange: TimeRangeKey = '7D') {
    const [selectedRange, setSelectedRange] = useState<TimeRangeKey>(defaultRange);

    const getTimeRange = () => {
        const range = TIME_RANGES[selectedRange];
        const end = Date.now();
        const start = range.ms === Infinity ? 0 : end - range.ms;

        return { start, end, label: range.label };
    };

    return {
        selectedRange,
        setSelectedRange,
        timeRange: getTimeRange(),
        ranges: TIME_RANGES
    };
}
