import { useState } from 'react';

export interface FilterState {
    status: string[];
    dateRange: { start: Date | null; end: Date | null };
    poolSize: { min: number; max: number };
    [key: string]: any;
}

interface UseFiltersResult {
    filters: FilterState;
    applyFilter: (key: string, value: any) => void;
    clearFilter: (key: string) => void;
    clearAll: () => void;
    hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: FilterState = {
    status: [],
    dateRange: { start: null, end: null },
    poolSize: { min: 0, max: Number.MAX_SAFE_INTEGER },
};

/**
 * Hook for managing filter state
 * Provides methods to apply, clear individual filters, or reset all
 */
export function useFilters(): UseFiltersResult {
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

    const applyFilter = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const clearFilter = (key: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: DEFAULT_FILTERS[key] || null,
        }));
    };

    const clearAll = () => {
        setFilters(DEFAULT_FILTERS);
    };

    // Check if any filters are active
    const hasActiveFilters = 
        filters.status.length > 0 ||
        filters.dateRange.start !== null ||
        filters.dateRange.end !== null ||
        filters.poolSize.min > 0 ||
        filters.poolSize.max < Number.MAX_SAFE_INTEGER;

    return {
        filters,
        applyFilter,
        clearFilter,
        clearAll,
        hasActiveFilters,
    };
}
