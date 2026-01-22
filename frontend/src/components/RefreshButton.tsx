import { memo, useState, useEffect } from 'react';

interface RefreshButtonProps {
    onRefresh: () => void;
    isLoading?: boolean;
    className?: string;
}

export const RefreshButton = memo(function RefreshButton({ 
    onRefresh, 
    isLoading = false, 
    className = '' 
}: RefreshButtonProps) {
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        // Update timestamp when refresh completes
        if (!isLoading) {
            setLastUpdated(new Date());
        }
    }, [isLoading]);

    useEffect(() => {
        // Listen for keyboard shortcut (R key)
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'r' || event.key === 'R') {
                if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                    // Only trigger if not in an input field
                    const target = event.target as HTMLElement;
                    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                        event.preventDefault();
                        onRefresh();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onRefresh]);

    const formatTimeSince = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span className="text-xs text-slate-400">
                Updated {formatTimeSince(lastUpdated)}
            </span>
            
            <button
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed group"
                title="Refresh market data (Press R)"
            >
                <svg 
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                </svg>
                <span className="text-sm font-medium">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </span>
            </button>
        </div>
    );
});
