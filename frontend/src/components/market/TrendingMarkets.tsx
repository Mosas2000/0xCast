import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TrendingMarketItem {
    id: string;
    title: string;
    volume: string;
    rank: number;
}

/**
 * Sidebar or list component for trending markets ranked by volume or activity.
 */
export const TrendingMarkets: React.FC<{ markets: TrendingMarketItem[] }> = ({ markets }) => {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <TrendingUp size={20} className="text-primary-400" />
                    <h3 className="text-lg font-bold text-white font-display">Trending Now</h3>
                </div>
                <BarChart3 size={18} className="text-slate-600" />
            </div>

            <div className="space-y-4">
                {markets.map((market) => (
                    <div
                        key={market.id}
                        className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-black text-slate-700 group-hover:text-primary-500/50 transition-colors tabular-nums w-4">
                                {market.rank}
                            </span>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors line-clamp-1">
                                {market.title}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-tighter">
                                {market.volume} VOL
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-3 border border-white/5 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                Explore Leaderboard
            </button>
        </div>
    );
};
