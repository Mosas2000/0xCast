import React from 'react';
import { Users, BarChart2, MessageSquare } from 'lucide-react';
import { Formatters } from '../../utils/Formatters';

interface SocialCounterProps {
    traders: number;
    volume: number;
    comments: number;
}

/**
 * Compact social engagement metrics for market cards and headers.
 */
export const SocialCounter: React.FC<SocialCounterProps> = ({ traders, volume, comments }) => {
    return (
        <div className="flex items-center space-x-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 group cursor-help">
                <Users size={14} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors">
                    {Formatters.abbreviateNumber(traders)}
                </span>
            </div>

            <div className="w-px h-3 bg-white/10" />

            <div className="flex items-center space-x-1.5 group cursor-help">
                <BarChart2 size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors">
                    {Formatters.abbreviateNumber(volume)} STX
                </span>
            </div>

            <div className="w-px h-3 bg-white/10" />

            <div className="flex items-center space-x-1.5 group cursor-help">
                <MessageSquare size={14} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors">
                    {Formatters.abbreviateNumber(comments)}
                </span>
            </div>
        </div>
    );
};
