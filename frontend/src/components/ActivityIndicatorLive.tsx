import { useContractEvents } from '../hooks/useContractEvents';

interface ActivityIndicatorLiveProps {
    className?: string;
}

/**
 * Real-time activity indicator that shows when new events are detected
 * Displays "Just now" badge for recent contract activity
 */
export function ActivityIndicatorLive({ className = '' }: ActivityIndicatorLiveProps) {
    const { events, isListening } = useContractEvents({
        enabled: true,
        pollInterval: 15000,
    });

    // Get the most recent event
    const recentEvent = events[0];
    
    // Check if event is within last 30 seconds
    const isRecent = recentEvent && 
        (Date.now() - recentEvent.timestamp.getTime()) < 30000;

    if (!isListening && events.length === 0) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 ${className}`.trim()}>
            {/* Listening Indicator */}
            {isListening && (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {/* Pulse animation */}
                        <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </div>
                    <span className="text-xs text-green-400 font-medium">
                        Live
                    </span>
                </div>
            )}

            {/* Recent Activity Badge */}
            {isRecent && recentEvent && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full animate-fade-in">
                    <svg 
                        className="w-3 h-3 text-blue-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 10V3L4 14h7v7l9-11h-7z" 
                        />
                    </svg>
                    <span className="text-xs text-blue-400 font-semibold">
                        {recentEvent.type === 'market_created' && 'New Market'}
                        {recentEvent.type === 'stake_placed' && 'New Stake'}
                        {recentEvent.type === 'market_resolved' && 'Resolved'}
                    </span>
                    <span className="text-xs text-blue-400/70">
                        Just now
                    </span>
                </div>
            )}

            {/* Event Count Badge */}
            {events.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-full">
                    <svg 
                        className="w-3 h-3 text-slate-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
                        />
                    </svg>
                    <span className="text-xs text-slate-400">
                        {events.length} {events.length === 1 ? 'event' : 'events'}
                    </span>
                </div>
            )}
        </div>
    );
}
