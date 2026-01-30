import React from 'react';
import { ShieldCheck, Star, ShieldAlert } from 'lucide-react';

interface VerifiedBadgeProps {
    type: 'human' | 'pro' | 'oracle' | 'dev';
    showLabel?: boolean;
}

/**
 * Premium verification badges for different user roles and trust levels.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ type, showLabel = false }) => {
    const configs = {
        human: {
            icon: ShieldCheck,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            label: 'Verified Human'
        },
        pro: {
            icon: Star,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            label: 'Pro Trader'
        },
        oracle: {
            icon: ShieldCheck,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            label: 'Market Oracle'
        },
        dev: {
            icon: ShieldAlert,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500/10',
            border: 'border-fuchsia-500/20',
            label: 'Core Dev'
        }
    };

    const { icon: Icon, color, bg, border, label } = configs[type];

    return (
        <div className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-lg border ${bg} ${border} ${color} shadow-sm group cursor-help relative`}>
            <Icon size={12} className="flex-shrink-0 group-hover:scale-125 transition-transform" />

            {showLabel && (
                <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">
                    {label}
                </span>
            )}

            {/* Hover Information Tooltip */}
            {!showLabel && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 border border-white/10 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {label}
                </div>
            )}
        </div>
    );
};
