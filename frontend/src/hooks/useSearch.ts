import { useState, useEffect, useMemo } from 'react';
import { Market } from '../types/market';

/**
 * Hook for searching markets by question text
 * @param markets - Array of markets to search
 * @param query - Search query string
 * @returns Filtered markets matching the query
 */
export function useSearch(markets: Market[], query: string): Market[] {
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce the query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Filter markets based on debounced query
    const filteredMarkets = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return markets;
        }

        const lowerQuery = debouncedQuery.toLowerCase();

        return markets.filter((market) =>
            market.question.toLowerCase().includes(lowerQuery)
        );
    }, [markets, debouncedQuery]);

    return filteredMarkets;
}
