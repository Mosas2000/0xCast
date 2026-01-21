interface FilterChip {
    id: string;
    label: string;
}

interface FilterChipsProps {
    filters: FilterChip[];
    selected: string[];
    onSelect: (filterId: string) => void;
    multiSelect?: boolean;
    className?: string;
}

export function FilterChips({ filters, selected, onSelect, multiSelect = true, className = '' }: FilterChipsProps) {
    const isSelected = (id: string) => selected.includes(id);

    return (
        <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onSelect(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected(filter.id)
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
