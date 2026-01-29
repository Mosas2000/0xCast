import React from 'react';
import { Filter, X } from 'lucide-react';
import { Card } from './Card';

interface FilterPanelProps {
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: any;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    onClose,
    onApply,
    currentFilters
}) => {
    const [tempFilters, setTempFilters] = React.useState(currentFilters);

    return (
        <Card className="fixed right-4 top-24 w-80 z-30 shadow-2xl border border-gray-100 animate-in slide-in-from-right-4 fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-lg font-bold text-gray-900">Filters</h4>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Market Category</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Crypto', 'Sports', 'Politics', 'Tech'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setTempFilters({ ...tempFilters, category: cat })}
                                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${tempFilters.category === cat
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Minimum Volume</label>
                    <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        className="w-full accent-indigo-600"
                        value={tempFilters.minVolume || 0}
                        onChange={(e) => setTempFilters({ ...tempFilters, minVolume: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between mt-2 text-xs font-bold text-gray-500">
                        <span>0 STX</span>
                        <span>{tempFilters.minVolume?.toLocaleString() || 0} STX</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
                <button
                    onClick={() => { setTempFilters({}); onApply({}); }}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={() => onApply(tempFilters)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </Card>
    );
};
