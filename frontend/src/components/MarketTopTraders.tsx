import React from 'react';
import { LeaderboardTable } from './LeaderboardTable';

export const MarketTopTraders: React.FC = () => {
    const traders = [
        { address: 'SP1...X2Y', displayName: 'WhaleKing', score: 15000, rank: 1, change: 0, badge: '🐳' },
        { address: 'SP2...A3B', displayName: 'SmartMoney', score: 8500, rank: 2, change: 2, badge: '🧠' },
        { address: 'SP3...C4D', displayName: 'AlphaOne', score: 6200, rank: 3, change: -1, badge: '🔥' },
        { address: 'SP4...E5F', displayName: 'DegenPro', score: 4800, rank: 4, change: 5, badge: '🎰' },
        { address: 'SP5...G6H', displayName: 'MoonShot', score: 3100, rank: 5, change: 0, badge: '🚀' },
    ];

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-900 px-2">Top Market Traders</h4>
            <LeaderboardTable entries={traders} />
        </div>
    );
};
