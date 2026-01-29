import React from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { Card } from './Card';
import { ChartTooltip } from './ChartTooltip';
import type { LineChartData } from '../types/analytics';

interface LineChartProps {
    title?: string;
    data: LineChartData;
    height?: number;
    showGrid?: boolean;
    areaStyle?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
    title,
    data,
    height = 300,
    showGrid = true,
    areaStyle = false
}) => {
    const flattenedData = data.labels.map((label, index) => {
        const point: any = { name: label };
        data.datasets.forEach(dataset => {
            point[dataset.label] = dataset.data[index];
        });
        return point;
    });

    const primaryDataset = data.datasets[0];

    return (
        <Card className="p-0 overflow-hidden">
            {title && (
                <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
                </div>
            )}
            <div className="p-6" style={{ height: `${height}px`, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {areaStyle ? (
                        <AreaChart data={flattenedData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />}
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
                                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            {data.datasets.map((dataset, index) => (
                                <Area
                                    key={dataset.label}
                                    type="monotone"
                                    dataKey={dataset.label}
                                    stroke={dataset.borderColor || '#6366f1'}
                                    fill={dataset.backgroundColor || 'rgba(99, 102, 241, 0.1)'}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#fff', stroke: dataset.borderColor || '#6366f1', strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            ))}
                        </AreaChart>
                    ) : (
                        <RechartsLineChart data={flattenedData}>
                            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />}
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
                                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            {data.datasets.map((dataset, index) => (
                                <Line
                                    key={dataset.label}
                                    type="monotone"
                                    dataKey={dataset.label}
                                    stroke={dataset.borderColor || '#6366f1'}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#fff', stroke: dataset.borderColor || '#6366f1', strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            ))}
                        </RechartsLineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
