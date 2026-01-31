import { useState, useEffect } from 'react';

export interface WatchlistItem {
    marketId: string;
    marketTitle: string;
    addedAt: number;
}

export const useWatchlist = (userAddress?: string) => {
    const [items, setItems] = useState<WatchlistItem[]>([]);

    useEffect(() => {
        if (!userAddress) return;
        const stored = localStorage.getItem(`watchlist_${userAddress}`);
        if (stored) setItems(JSON.parse(stored));
    }, [userAddress]);

    const addToWatchlist = (market: Omit<WatchlistItem, 'addedAt'>) => {
        const newItem = { ...market, addedAt: Date.now() };
        const updated = [...items, newItem];
        setItems(updated);
        if (userAddress) localStorage.setItem(`watchlist_${userAddress}`, JSON.stringify(updated));
    };

    const removeFromWatchlist = (marketId: string) => {
        const updated = items.filter(i => i.marketId !== marketId);
        setItems(updated);
        if (userAddress) localStorage.setItem(`watchlist_${userAddress}`, JSON.stringify(updated));
    };

    return { items, addToWatchlist, removeFromWatchlist };
};
