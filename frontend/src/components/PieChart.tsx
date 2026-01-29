import React from 'react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from 'recharts';
import { Card } from './Card';
import { CHART_COLORS } from '../constants/analytics';
import type { PieChartData } from '../types/analytics';

interface PieChartProps {
    title?: string;
    data: PieChartData;
    height?: number;
    donut?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
    title,
    data,
    height = 300,
    donut = true
}) => {
    const chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.data[index],
        color: data.colors?.[index] || Object.values(CHART_COLORS)[index % 7]
    }));

    return (
        <Card className="p-0 overflow-hidden">
            {title && (
                <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
                </div>
            )}
            <div className="p-6" style={{ height: `${height}px`, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData}
                            innerRadius={donut ? '60%' : 0}
                            outerRadius="90%"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const entry = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 shadow-xl border border-gray-100 rounded-xl">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <span className="text-sm font-bold text-gray-900">{entry.name}</span>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-gray-600">
                                                {entry.value.toLocaleString()} ({((entry.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
