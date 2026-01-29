import React from 'react';
import { Card } from './Card';
import { TrendIndicator } from './TrendIndicator';
import { formatNumber, formatCurrency, formatSTX, formatPercentage } from '../utils/analytics';
import type { MetricValue } from '../types/analytics';

interface MetricCardProps {
    title: string;
    metric: MetricValue;
    type?: 'number' | 'currency' | 'stx' | 'percentage';
    icon?: React.ReactNode;
    loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    metric,
    type = 'number',
    icon,
    loading = false
}) => {
    const formatValue = (val: number) => {
        switch (type) {
            case 'currency': return formatCurrency(val);
            case 'stx': return formatSTX(val);
            case 'percentage': return formatPercentage(val);
            default: return formatNumber(val);
        }
    };

    if (loading) {
        return (
            <Card className="animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <h3 className="mt-1 text-2xl font-bold text-gray-900">{formatValue(metric.current)}</h3>
                    {metric.change !== undefined && (
                        <div className="mt-2 flex items-center space-x-2">
                            <TrendIndicator trend={metric.trend} />
                            <span className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' :
                                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                {metric.changePercent !== undefined && `${metric.changePercent.toFixed(1)}%`}
                            </span>
                            <span className="text-xs text-gray-400">vs prev</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
};
