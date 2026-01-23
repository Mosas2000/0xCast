import { Sidebar } from './Sidebar';
import { useFilters } from '../hooks/useFilters';
import { DateRangeFilter } from './DateRangeFilter';
import { PoolSizeFilter } from './PoolSizeFilter';
import { StatusFilter } from './StatusFilter';

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    statusCounts?: Record<string, number>;
}

/**
 * Filter sidebar component
 * Provides advanced filtering options for market list
 */
export function FilterSidebar({ isOpen, onClose, onApply, statusCounts }: FilterSidebarProps) {
    const { filters, applyFilter, clearAll, hasActiveFilters } = useFilters();

    const handleApply = () => {
        onApply();
        onClose();
    };

    const handleReset = () => {
        clearAll();
    };

    return (
        <Sidebar
            isOpen={isOpen}
            onClose={onClose}
            title="Filters"
            side="right"
        >
            <div className="flex flex-col h-full">
                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Status Filter */}
                    <StatusFilter
                        value={filters.status}
                        onChange={(statuses) => applyFilter('status', statuses)}
                        statusCounts={statusCounts}
                    />

                    <div className="border-t border-slate-700 my-4" />

                    {/* Date Range Filter */}
                    <DateRangeFilter
                        value={filters.dateRange}
                        onChange={(range) => applyFilter('dateRange', range)}
                    />

                    <div className="border-t border-slate-700 my-4" />

                    {/* Pool Size Filter */}
                    <PoolSizeFilter
                        value={filters.poolSize}
                        onChange={(range) => applyFilter('poolSize', range)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-700 px-6 py-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            disabled={!hasActiveFilters}
                            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 disabled:text-slate-500 rounded-lg font-medium transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>

                    {/* Active Filters Count */}
                    {hasActiveFilters && (
                        <div className="mt-3 text-xs text-center text-slate-400">
                            Active filters applied
                        </div>
                    )}
                </div>
            </div>
        </Sidebar>
    );
}
