import React from 'react';

export const SeasonPass: React.FC = () => {
    const tier = 'Gold';
    const level = 15;
    const rewards = ['NFT Badge', '500 STX', 'Exclusive Avatar'];

    return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">Season Pass - {tier}</h3>
            <div className="mb-4">
                <p className="text-sm opacity-90 mb-2">Level {level}/50</p>
                <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full" style={{ width: `${(level / 50) * 100}%` }}></div>
                </div>
            </div>
            <div className="space-y-2">
                <p className="font-semibold">Unlocked Rewards:</p>
                {rewards.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span>✓</span>
                        <span>{r}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
