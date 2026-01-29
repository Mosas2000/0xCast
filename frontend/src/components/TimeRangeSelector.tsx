import React from 'react';
import type { TimeRangeKey } from '../hooks/analytics/useTimeRange';

interface TimeRangeSelectorProps {
    selectedRange: TimeRangeKey;
    onRangeChange: (range: TimeRangeKey) => void;
    ranges: Record<string, { label: string }>;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
    selectedRange,
    onRangeChange,
    ranges
}) => {
    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {(Object.keys(ranges) as TimeRangeKey[]).map((key) => (
                <button
                    key={key}
                    onClick={() => onRangeChange(key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${selectedRange === key
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {key}
                </button>
            ))}
        </div>
    );
};
