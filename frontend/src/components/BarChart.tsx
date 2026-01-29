import React from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card } from './Card';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS } from '../constants/analytics';
import type { BarChartData } from '../types/analytics';

interface BarChartProps {
    title?: string;
    data: BarChartData;
    height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
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
                    <RechartsBarChart data={flattenedData}>
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
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                        {data.datasets.map((dataset, index) => (
                            <Bar
                                key={dataset.label}
                                dataKey={dataset.label}
                                fill={dataset.backgroundColor || CHART_COLORS.primary}
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
