import React from 'react';

type BadgeStatus = 'active' | 'ending' | 'resolved' | 'cancelled';

interface BadgeRefinedProps {
    status: BadgeStatus;
    label?: string;
}

/**
 * Professional market state badges with vibrant gradients and glassmorphism.
 */
export const BadgeRefined: React.FC<BadgeRefinedProps> = ({ status, label }) => {
    const themes: Record<BadgeStatus, { bg: string, text: string, shadow: string }> = {
        active: {
            bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
            text: 'text-emerald-400',
            shadow: 'shadow-emerald-500/10'
        },
        ending: {
            bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30',
            text: 'text-amber-400',
            shadow: 'shadow-amber-500/10'
        },
        resolved: {
            bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30',
            text: 'text-blue-400',
            shadow: 'shadow-blue-500/10'
        },
        cancelled: {
            bg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-500/30',
            text: 'text-rose-400',
            shadow: 'shadow-rose-500/10'
        }
    };

    const { bg, text, shadow } = themes[status];
    const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-lg ${bg} ${text} ${shadow} backdrop-blur-md`}>
            <span className={`w-1 h-1 rounded-full mr-1.5 animate-pulse ${text.replace('text', 'bg')}`} />
            {displayLabel}
        </span>
    );
};
