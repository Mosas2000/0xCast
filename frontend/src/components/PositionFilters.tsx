import { useState } from 'react';

export type PositionFilter = 'all' | 'active' | 'won' | 'lost' | 'claimable';
export type PositionSort = 'recent' | 'largest' | 'performance';

interface PositionFiltersProps {
    selectedFilter: PositionFilter;
    selectedSort: PositionSort;
    onFilterChange: (filter: PositionFilter) => void;
    onSortChange: (sort: PositionSort) => void;
    counts?: {
        all: number;
        active: number;
        won: number;
        lost: number;
        claimable: number;
    };
}

export function PositionFilters({
    selectedFilter,
    selectedSort,
    onFilterChange,
    onSortChange,
    counts,
}: PositionFiltersProps) {
    const filters: { value: PositionFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'won', label: 'Won' },
        { value: 'lost', label: 'Lost' },
        { value: 'claimable', label: 'Claimable' },
    ];

    const sorts: { value: PositionSort; label: string }[] = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'largest', label: 'Largest Stake' },
        { value: 'performance', label: 'Best Performance' },
    ];

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFilter === filter.value
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {filter.label}
                        {counts && counts[filter.value] > 0 && (
                            <span className="ml-2 text-xs opacity-75">({counts[filter.value]})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <select
                    value={selectedSort}
                    onChange={(e) => onSortChange(e.target.value as PositionSort)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {sorts.map((sort) => (
                        <option key={sort.value} value={sort.value}>
                            {sort.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
