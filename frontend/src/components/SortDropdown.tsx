export type SortOption = 'newest' | 'ending-soon' | 'highest-pool' | 'most-popular';

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
    className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'highest-pool', label: 'Highest Pool' },
    { value: 'most-popular', label: 'Most Popular' },
];

export function SortDropdown({ value, onChange, className = '' }: SortDropdownProps) {
    return (
        <div className={`flex items-center space-x-2 ${className}`.trim()}>
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as SortOption)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
