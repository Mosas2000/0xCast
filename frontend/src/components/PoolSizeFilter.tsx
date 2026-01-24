import { useState, useEffect } from 'react';

interface PoolSizeFilterProps {
    value: { min: number | null; max: number | null };
    onChange: (range: { min: number | null; max: number | null }) => void;
    className?: string;
}

/**
 * Pool size filter component
 * Allows filtering by pool size with slider and preset ranges
 */
export function PoolSizeFilter({ value, onChange, className = '' }: PoolSizeFilterProps) {
    const [minInput, setMinInput] = useState(value.min?.toString() ?? '');
    const [maxInput, setMaxInput] = useState(value.max?.toString() ?? '');

    useEffect(() => {
        setMinInput(value.min?.toString() ?? '');
        setMaxInput(value.max?.toString() ?? '');
    }, [value]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setMinInput(newValue);
        
        if (newValue === '') {
            onChange({ ...value, min: null });
        } else {
            const num = parseFloat(newValue);
            if (!isNaN(num) && num >= 0) {
                onChange({ ...value, min: num });
            }
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setMaxInput(newValue);
        
        if (newValue === '') {
            onChange({ ...value, max: null });
        } else {
            const num = parseFloat(newValue);
            if (!isNaN(num) && num >= 0) {
                onChange({ ...value, max: num });
            }
        }
    };

    const applyPreset = (preset: 'small' | 'medium' | 'large') => {
        switch (preset) {
            case 'small':
                onChange({ min: 0, max: 1000 });
                break;
            case 'medium':
                onChange({ min: 1000, max: 10000 });
                break;
            case 'large':
                onChange({ min: 10000, max: null });
                break;
        }
    };

    return (
        <div className={`space-y-4 ${className}`.trim()}>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pool Size (STX)
                </label>

                {/* Preset Buttons */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => applyPreset('small')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        Small (0-1K)
                    </button>
                    <button
                        onClick={() => applyPreset('medium')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        Medium (1K-10K)
                    </button>
                    <button
                        onClick={() => applyPreset('large')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        Large (10K+)
                    </button>
                </div>

                {/* Min/Max Inputs */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Minimum</label>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={minInput}
                            onChange={handleMinChange}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Maximum</label>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={maxInput}
                            onChange={handleMaxChange}
                            placeholder="No limit"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Range Display */}
                {(value.min !== null || value.max !== null) && (
                    <div className="mt-3 text-xs text-slate-400">
                        Range: {value.min ?? 0} STX - {value.max ? `${value.max} STX` : 'No limit'}
                    </div>
                )}
            </div>
        </div>
    );
}
