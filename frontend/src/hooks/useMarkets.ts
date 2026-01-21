import { useState, useEffect, useCallback } from 'react';
import { Market } from '../types/market';

// For now, return empty array since we need to implement market fetching
// This will be expanded to fetch from contract
export function useMarkets() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMarkets = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implement actual market fetching from contract
            // For now, return empty array
            setMarkets([]);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching markets:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch markets');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    return {
        markets,
        isLoading,
        error,
        refetch: fetchMarkets,
    };
}
