import { memo } from 'react';

interface LiveMarketBadgeProps {
    className?: string;
}

export const LiveMarketBadge = memo(function LiveMarketBadge({ className = '' }: LiveMarketBadgeProps) {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full ${className}`}>
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                Live on Mainnet
            </span>
        </div>
    );
});
