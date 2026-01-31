import React from 'react';

type StatusColor = 'emerald' | 'amber' | 'rose' | 'primary' | 'slate';

interface StatusDotProps {
    status: StatusColor;
    animate?: boolean;
}

/**
 * Minimalist status indicator dot for lists and tiny UI elements.
 */
export const StatusDot: React.FC<StatusDotProps> = ({ status, animate = false }) => {
    const colors: Record<StatusColor, string> = {
        emerald: 'bg-emerald-500 shadow-emerald-500/50',
        amber: 'bg-amber-500 shadow-amber-500/50',
        rose: 'bg-rose-500 shadow-rose-500/50',
        primary: 'bg-primary-500 shadow-primary-500/50',
        slate: 'bg-slate-500 shadow-slate-500/20'
    };

    return (
        <div className="relative flex items-center justify-center w-3 h-3">
            <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${colors[status]}`} />
            {animate && (
                <div className={`absolute w-full h-full rounded-full opacity-40 animate-ping ${colors[status]}`} />
            )}
        </div>
    );
};
