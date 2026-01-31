import React, { useState } from 'react';

export const MarketCollections: React.FC = () => {
    const [collections] = useState([
        { id: '1', name: 'Crypto Predictions', count: 12 },
        { id: '2', name: 'Sports Bets', count: 8 },
    ]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">My Collections</h3>
            <div className="space-y-2">
                {collections.map(col => (
                    <div key={col.id} className="p-3 bg-gray-50 rounded-lg flex justify-between">
                        <span className="font-semibold">{col.name}</span>
                        <span className="text-gray-600">{col.count} markets</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
