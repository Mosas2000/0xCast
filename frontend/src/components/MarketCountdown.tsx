import { useState, useEffect } from 'react';

interface MarketCountdownProps {
    endBlock: number;
    currentBlock: number;
    className?: string;
}

const BLOCKS_PER_MINUTE = 1 / 10; // ~10 minutes per block on Stacks
const BLOCKS_PER_HOUR = BLOCKS_PER_MINUTE * 60;
const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24;

/**
 * Live countdown to market end date
 * Shows remaining time in human-readable format
 * Red warning when less than 24 hours remain
 */
export function MarketCountdown({ endBlock, currentBlock, className = '' }: MarketCountdownProps) {
    const [, setTick] = useState(0);

    // Update every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setTick(prev => prev + 1);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const blocksRemaining = Math.max(0, endBlock - currentBlock);
    const daysRemaining = Math.floor(blocksRemaining / BLOCKS_PER_DAY);
    const hoursRemaining = Math.floor((blocksRemaining % BLOCKS_PER_DAY) / BLOCKS_PER_HOUR);
    const minutesRemaining = Math.floor((blocksRemaining % BLOCKS_PER_HOUR) / BLOCKS_PER_MINUTE);

    // Check if ending soon (< 1 day)
    const isEndingSoon = blocksRemaining < BLOCKS_PER_DAY;
    const hasEnded = blocksRemaining === 0;

    if (hasEnded) {
        return (
            <span className={`inline-flex items-center gap-1 text-red-400 font-semibold ${className}`.trim()}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ended
            </span>
        );
    }

    const formatTime = () => {
        const parts = [];
        
        if (daysRemaining > 0) {
            parts.push(`${daysRemaining}d`);
        }
        if (hoursRemaining > 0 || daysRemaining > 0) {
            parts.push(`${hoursRemaining}h`);
        }
        if (minutesRemaining > 0 || parts.length === 0) {
            parts.push(`${minutesRemaining}m`);
        }
        
        return parts.join(' ');
    };

    return (
        <span 
            className={`
                inline-flex items-center gap-1.5 font-semibold
                ${isEndingSoon ? 'text-red-400 animate-pulse' : 'text-slate-400'}
                ${className}
            `.trim()}
        >
            {isEndingSoon && (
                <span className="text-base" title="Ending soon!">
                    🔥
                </span>
            )}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ends in {formatTime()}</span>
        </span>
    );
}
