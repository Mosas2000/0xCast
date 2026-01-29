import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ResolutionTimerProps {
    endDate: number; // timestamp in ms
}

/**
 * Animated countdown timer for market resolution.
 */
export const ResolutionTimer: React.FC<ResolutionTimerProps> = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const calculateTime = () => {
            const difference = endDate - Date.now();
            if (difference <= 0) return 'Ended';

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            if (days > 0) return `${days}d ${hours}h`;
            return `${hours}h ${minutes}m ${seconds}s`;
        };

        const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
        setTimeLeft(calculateTime());

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-white/5 text-slate-300">
            <Clock size={12} className="text-primary-400" />
            <span className="text-[10px] font-bold tracking-wider uppercase tabular-nums">
                {timeLeft}
            </span>
        </div>
    );
};
