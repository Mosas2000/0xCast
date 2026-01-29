import React from 'react';

/**
 * Shimmering skeleton loader for Market Cards to improve perceived performance during data fetching.
 */
export const MarketSkeleton: React.FC = () => {
    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="w-12 h-5 bg-white/5 rounded-lg" />
                <div className="w-20 h-5 bg-white/5 rounded-lg" />
            </div>

            <div className="space-y-2">
                <div className="w-full h-6 bg-white/10 rounded-lg" />
                <div className="w-2/3 h-6 bg-white/10 rounded-lg" />
            </div>

            <div className="pt-4 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="w-24 h-4 bg-white/5 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6">
                <div className="h-12 bg-white/5 rounded-2xl" />
                <div className="h-12 bg-white/5 rounded-2xl" />
            </div>
        </div>
    );
};

export default MarketSkeleton;
