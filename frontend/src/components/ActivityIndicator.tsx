interface ActivityIndicatorProps {
    lastActivityTime: number | null;
    activityCount: number;
    className?: string;
}

export function ActivityIndicator({ lastActivityTime, activityCount, className = '' }: ActivityIndicatorProps) {
    const getActivityStatus = () => {
        if (!lastActivityTime) return 'cold';

        const now = Date.now();
        const timeSinceActivity = now - lastActivityTime;

        if (timeSinceActivity < 300000) return 'hot'; // 5 minutes
        if (timeSinceActivity < 1800000) return 'warm'; // 30 minutes
        return 'cold';
    };

    const status = getActivityStatus();

    if (status === 'cold' && activityCount === 0) return null;

    return (
        <div className={`inline-flex items-center space-x-2 ${className}`.trim()}>
            {/* Hot Badge */}
            {status === 'hot' && (
                <div className="relative">
                    <div className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-red-400">HOT</span>
                    </div>
                    {/* Pulse Animation */}
                    <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
                </div>
            )}

            {/* Warm Indicator */}
            {status === 'warm' && (
                <div className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-xs font-medium text-orange-400">Active</span>
                </div>
            )}

            {/* Activity Count */}
            {activityCount > 0 && (
                <span className="text-xs text-slate-400">
                    {activityCount} {activityCount === 1 ? 'stake' : 'stakes'}
                </span>
            )}
        </div>
    );
}
