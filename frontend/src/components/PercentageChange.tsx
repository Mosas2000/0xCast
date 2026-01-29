import React from 'react';
import { TrendIndicator } from './TrendIndicator';

interface PercentageChangeProps {
    value: number;
    showIcon?: boolean;
}

export const PercentageChange: React.FC<PercentageChangeProps> = ({
    value,
    showIcon = true
}) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const trend = isPositive ? 'up' : isNegative ? 'down' : 'neutral';

    const colorClass = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';

    return (
        <div className={`inline-flex items-center font-semibold ${colorClass}`}>
            {showIcon && <span className="mr-1"><TrendIndicator trend={trend} size="sm" /></span>}
            {isPositive && '+'}
            {value.toFixed(1)}%
        </div>
    );
};
