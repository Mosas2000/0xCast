import React from 'react';

const categories = [
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', count: 45 },
    { id: 'sports', name: 'Sports', icon: '⚽', count: 32 },
    { id: 'politics', name: 'Politics', icon: '🏛️', count: 28 },
    { id: 'tech', name: 'Technology', icon: '💻', count: 19 },
];

export const CategoryBrowser: React.FC = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <h3 className="font-bold text-lg">{cat.name}</h3>
                    <p className="text-gray-600 text-sm">{cat.count} markets</p>
                </div>
            ))}
        </div>
    );
};
