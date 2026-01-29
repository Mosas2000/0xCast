import React from 'react';

interface ChartControlsProps {
    onToggleGrid: () => void;
    onToggleArea: () => void;
    showGrid: boolean;
    isArea: boolean;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
    onToggleGrid,
    onToggleArea,
    showGrid,
    isArea
}) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl">
            <button
                onClick={onToggleGrid}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${showGrid ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
                    }`}
            >
                Grid
            </button>
            <button
                onClick={onToggleArea}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${isArea ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
                    }`}
            >
                Area
            </button>
        </div>
    );
};
