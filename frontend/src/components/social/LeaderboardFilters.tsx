import React from 'react';
import { Filter, Calendar, TrendingUp, Users, ArrowDownWideZap } from 'lucide-react';

interface LeaderboardFiltersProps {
    onFilterChange: (type: string, value: string) => void;
}

/**
 * Advanced filtering UI for the global leaderboard, allowing users to pivot by time, volume, and accuracy.
 */
export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({ onFilterChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-2 rounded-[2rem] border border-white/5 backdrop-blur-md">
            {/* Time Range */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
                <button
                    onClick={() => onFilterChange('time', '24h')}
                    className="px-5 py-2 text-[10px] font-black text-white bg-white/10 rounded-xl transition-all shadow-lg"
                >
                    24H
                </button>
                <button
                    onClick={() => onFilterChange('time', '7d')}
                    className="px-5 py-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors"
                >
                    7D
                </button>
                <button
                    onClick={() => onFilterChange('time', 'all')}
                    className="px-5 py-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors"
                >
                    ALL
                </button>
            </div>

            {/* Metric Pivot */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
                <button
                    onClick={() => onFilterChange('metric', 'roi')}
                    className="flex items-center space-x-2 px-5 py-2 text-[10px] font-black text-indigo-400 hover:bg-white/5 rounded-xl transition-all"
                >
                    <TrendingUp size={14} />
                    <span>HIGHEST ROI</span>
                </button>
                <button
                    onClick={() => onFilterChange('metric', 'volume')}
                    className="flex items-center space-x-2 px-5 py-2 text-[10px] font-black text-slate-500 hover:text-white rounded-xl transition-all"
                >
                    <ArrowDownWideZap size={14} />
                    <span>VOLUME</span>
                </button>
                <button
                    onClick={() => onFilterChange('metric', 'accuracy')}
                    className="flex items-center space-x-2 px-5 py-2 text-[10px] font-black text-slate-500 hover:text-white rounded-xl transition-all"
                >
                    <Users size={14} />
                    <span>ACCURACY</span>
                </button>
            </div>

            <div className="h-8 w-px bg-white/5 mx-2" />

            {/* Search Input Mock */}
            <div className="relative group flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-600 group-focus-within:text-white transition-colors">
                    <Filter size={14} />
                </div>
                <input
                    placeholder="Filter by name or rank..."
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
                />
            </div>
        </div>
    );
};
