import React from 'react';

export const DailyChallenges: React.FC = () => {
    const challenges = [
        { id: '1', title: 'Make 3 trades', progress: 2, total: 3, reward: 50 },
        { id: '2', title: 'Win a market', progress: 0, total: 1, reward: 100 },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Daily Challenges</h3>
            {challenges.map(c => (
                <div key={c.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">{c.title}</span>
                        <span className="text-yellow-600">+{c.reward} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(c.progress / c.total) * 100}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{c.progress}/{c.total}</span>
                </div>
            ))}
        </div>
    );
};
