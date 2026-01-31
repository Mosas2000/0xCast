import { useState, useEffect } from 'react';

export const useSavedSearches = (userAddress?: string) => {
    const [searches, setSearches] = useState<Array<{ id: string; query: string; filters: any }>>([]);

    useEffect(() => {
        if (!userAddress) return;
        const stored = localStorage.getItem(`saved_searches_${userAddress}`);
        if (stored) setSearches(JSON.parse(stored));
    }, [userAddress]);

    const saveSearch = (query: string, filters: any) => {
        const newSearch = { id: `search_${Date.now()}`, query, filters };
        const updated = [...searches, newSearch];
        setSearches(updated);
        if (userAddress) localStorage.setItem(`saved_searches_${userAddress}`, JSON.stringify(updated));
    };

    return { searches, saveSearch };
};
