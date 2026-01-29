import React from 'react';

export const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 shadow-xl border border-gray-100 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-tight">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {typeof entry.value === 'number'
                                    ? entry.value >= 1000
                                        ? entry.value.toLocaleString()
                                        : entry.value.toFixed(2)
                                    : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};
