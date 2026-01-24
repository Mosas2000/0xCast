interface DateRangeFilterProps {
    value: { start: Date | null; end: Date | null };
    onChange: (range: { start: Date | null; end: Date | null }) => void;
    className?: string;
}

/**
 * Date range filter component
 * Allows filtering by start and end dates with preset ranges
 */
export function DateRangeFilter({ value, onChange, className = '' }: DateRangeFilterProps) {
    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onChange({ ...value, start: date });
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onChange({ ...value, end: date });
    };

    const applyPreset = (preset: 'today' | 'week' | 'month') => {
        const now = new Date();
        const start = new Date();

        switch (preset) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                onChange({ start, end: now });
                break;
            case 'week':
                start.setDate(now.getDate() - 7);
                onChange({ start, end: now });
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                onChange({ start, end: now });
                break;
        }
    };

    const formatDateForInput = (date: Date | null) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    return (
        <div className={`space-y-4 ${className}`.trim()}>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date Range
                </label>

                {/* Preset Buttons */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => applyPreset('today')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => applyPreset('week')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => applyPreset('month')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        This Month
                    </button>
                </div>

                {/* Date Inputs */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={formatDateForInput(value.start)}
                            onChange={handleStartChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">End Date</label>
                        <input
                            type="date"
                            value={formatDateForInput(value.end)}
                            onChange={handleEndChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
