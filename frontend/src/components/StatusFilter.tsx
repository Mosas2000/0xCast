interface StatusFilterProps {
    value: string[];
    onChange: (statuses: string[]) => void;
    statusCounts?: Record<string, number>;
    className?: string;
}

const AVAILABLE_STATUSES = [
    { id: 'active', label: 'Active' },
    { id: 'ended', label: 'Ended' },
    { id: 'resolved', label: 'Resolved' },
];

/**
 * Status filter component
 * Allows filtering by market status with checkboxes and counts
 */
export function StatusFilter({ value, onChange, statusCounts = {}, className = '' }: StatusFilterProps) {
    const handleToggle = (statusId: string) => {
        if (value.includes(statusId)) {
            onChange(value.filter(s => s !== statusId));
        } else {
            onChange([...value, statusId]);
        }
    };

    const handleSelectAll = () => {
        if (value.length === AVAILABLE_STATUSES.length) {
            onChange([]);
        } else {
            onChange(AVAILABLE_STATUSES.map(s => s.id));
        }
    };

    const allSelected = value.length === AVAILABLE_STATUSES.length;

    return (
        <div className={`space-y-4 ${className}`.trim()}>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                        Status
                    </label>
                    <button
                        onClick={handleSelectAll}
                        className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {/* Status Checkboxes */}
                <div className="space-y-2">
                    {AVAILABLE_STATUSES.map(status => {
                        const count = statusCounts[status.id] ?? 0;
                        const isChecked = value.includes(status.id);

                        return (
                            <label
                                key={status.id}
                                className="flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-750 rounded-lg cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggle(status.id)}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-colors"
                                    />
                                    <span className="text-sm text-slate-300 group-hover:text-slate-200">
                                        {status.label}
                                    </span>
                                </div>
                                {count > 0 && (
                                    <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-700 rounded">
                                        {count}
                                    </span>
                                )}
                            </label>
                        );
                    })}
                </div>

                {/* Active Filter Summary */}
                {value.length > 0 && value.length < AVAILABLE_STATUSES.length && (
                    <div className="mt-3 text-xs text-slate-400">
                        {value.length} of {AVAILABLE_STATUSES.length} statuses selected
                    </div>
                )}
            </div>
        </div>
    );
}
