import React from 'react';
import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card } from './Card';
import { ChartTooltip } from './ChartTooltip';
import type { LineChartData } from '../types/analytics';

interface AreaChartProps {
    title?: string;
    data: LineChartData;
    height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({
    title,
    data,
    height = 300
}) => {
    const flattenedData = data.labels.map((label, index) => {
        const point: any = { name: label };
        data.datasets.forEach(dataset => {
            point[dataset.label] = dataset.data[index];
        });
        return point;
    });

    return (
        <Card className="p-0 overflow-hidden">
            {title && (
                <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
                </div>
            )}
            <div className="p-6" style={{ height: `${height}px`, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart data={flattenedData}>
                        <defs>
                            {data.datasets.map((dataset, index) => (
                                <linearGradient key={`grad-${index}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={dataset.borderColor || '#6366f1'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={dataset.borderColor || '#6366f1'} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        {data.datasets.map((dataset, index) => (
                            <Area
                                key={dataset.label}
                                type="monotone"
                                dataKey={dataset.label}
                                stroke={dataset.borderColor || '#6366f1'}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#color-${index})`}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        ))}
                    </RechartsAreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
