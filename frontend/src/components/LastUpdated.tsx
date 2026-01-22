import { useState, useEffect } from 'react';

interface LastUpdatedProps {
    timestamp: Date | null;
    className?: string;
}

/**
 * Component that displays relative time since last update
 * Updates every second to show fresh timing
 */
export function LastUpdated({ timestamp, className = '' }: LastUpdatedProps) {
    const [relativeTime, setRelativeTime] = useState<string>('');

    useEffect(() => {
        if (!timestamp) {
            setRelativeTime('Never');
            return;
        }

        const updateRelativeTime = () => {
            const now = new Date();
            const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

            if (diff < 5) {
                setRelativeTime('Just now');
            } else if (diff < 60) {
                setRelativeTime(`${diff} seconds ago`);
            } else if (diff < 3600) {
                const minutes = Math.floor(diff / 60);
                setRelativeTime(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`);
            } else if (diff < 86400) {
                const hours = Math.floor(diff / 3600);
                setRelativeTime(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
            } else {
                const days = Math.floor(diff / 86400);
                setRelativeTime(`${days} ${days === 1 ? 'day' : 'days'} ago`);
            }
        };

        // Initial update
        updateRelativeTime();

        // Update every second
        const interval = setInterval(updateRelativeTime, 1000);

        return () => clearInterval(interval);
    }, [timestamp]);

    if (!timestamp) {
        return null;
    }

    return (
        <div className={`text-xs text-slate-500 ${className}`.trim()}>
            <span className="inline-flex items-center gap-1">
                <svg 
                    className="w-3 h-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
                Last updated {relativeTime}
            </span>
        </div>
    );
}
