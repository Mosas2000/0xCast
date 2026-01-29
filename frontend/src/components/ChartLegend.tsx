import React from 'react';

interface ChartLegendProps {
    payload?: any[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ payload }) => {
    if (!payload) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center space-x-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-semibold text-gray-600">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};
