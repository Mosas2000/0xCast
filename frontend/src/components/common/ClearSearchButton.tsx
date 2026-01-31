import React from 'react';
import { X } from 'lucide-react';

interface ClearSearchButtonProps {
    onClear: () => void;
    isVisible: boolean;
}

/**
 * Small overlay button to clear search input fields.
 */
export const ClearSearchButton: React.FC<ClearSearchButtonProps> = ({ onClear, isVisible }) => {
    if (!isVisible) return null;

    return (
        <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
            title="Clear search"
        >
            <X size={14} />
        </button>
    );
};
