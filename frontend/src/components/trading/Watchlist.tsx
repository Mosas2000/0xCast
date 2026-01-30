import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';

export const Watchlist: React.FC<{ userAddress?: string }> = ({ userAddress }) => {
    const { items, removeFromWatchlist } = useWatchlist(userAddress);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Watchlist</h3>
            {items.length === 0 ? (
                <p className="text-gray-500">No markets in watchlist</p>
            ) : (
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.marketId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span>{item.marketTitle}</span>
                            <button onClick={() => removeFromWatchlist(item.marketId)} className="text-red-600 hover:text-red-700">Remove</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
