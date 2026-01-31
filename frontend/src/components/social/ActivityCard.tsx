import React from 'react';

export type ActivityType =
    | 'trade'
    | 'market_created'
    | 'market_resolved'
    | 'comment'
    | 'follow'
    | 'achievement';

export interface Activity {
    id: string;
    type: ActivityType;
    user: {
        address: string;
        username: string;
        avatar: string;
    };
    timestamp: number;
    data: {
        marketId?: string;
        marketTitle?: string;
        amount?: number;
        outcome?: string;
        comment?: string;
        achievement?: string;
        targetUser?: string;
    };
}

interface ActivityCardProps {
    activity: Activity;
    onUserClick?: (address: string) => void;
    onMarketClick?: (marketId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
    activity,
    onUserClick,
    onMarketClick,
}) => {
    const getActivityIcon = () => {
        switch (activity.type) {
            case 'trade':
                return '💰';
            case 'market_created':
                return '🎯';
            case 'market_resolved':
                return '✅';
            case 'comment':
                return '💬';
            case 'follow':
                return '👥';
            case 'achievement':
                return '🏆';
            default:
                return '📌';
        }
    };

    const getActivityText = () => {
        const { data } = activity;

        switch (activity.type) {
            case 'trade':
                return (
                    <>
                        placed a <span className="font-semibold">{data.amount} STX</span> bet on{' '}
                        <span className="font-semibold text-blue-600">{data.outcome}</span> in{' '}
                        <button
                            onClick={() => data.marketId && onMarketClick?.(data.marketId)}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            {data.marketTitle}
                        </button>
                    </>
                );
            case 'market_created':
                return (
                    <>
                        created a new market:{' '}
                        <button
                            onClick={() => data.marketId && onMarketClick?.(data.marketId)}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            {data.marketTitle}
                        </button>
                    </>
                );
            case 'market_resolved':
                return (
                    <>
                        resolved market{' '}
                        <button
                            onClick={() => data.marketId && onMarketClick?.(data.marketId)}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            {data.marketTitle}
                        </button>
                        {' '}with outcome: <span className="font-semibold text-green-600">{data.outcome}</span>
                    </>
                );
            case 'comment':
                return (
                    <>
                        commented on{' '}
                        <button
                            onClick={() => data.marketId && onMarketClick?.(data.marketId)}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            {data.marketTitle}
                        </button>
                        {data.comment && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700 italic">
                                "{data.comment}"
                            </div>
                        )}
                    </>
                );
            case 'follow':
                return (
                    <>
                        started following{' '}
                        <button
                            onClick={() => data.targetUser && onUserClick?.(data.targetUser)}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            {data.targetUser}
                        </button>
                    </>
                );
            case 'achievement':
                return (
                    <>
                        unlocked achievement:{' '}
                        <span className="font-semibold text-yellow-600">🏆 {data.achievement}</span>
                    </>
                );
            default:
                return 'performed an action';
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                {/* User Avatar */}
                <button
                    onClick={() => onUserClick?.(activity.user.address)}
                    className="flex-shrink-0"
                >
                    <img
                        src={activity.user.avatar}
                        alt={activity.user.username}
                        className="w-12 h-12 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                </button>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getActivityIcon()}</span>
                        <button
                            onClick={() => onUserClick?.(activity.user.address)}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            {activity.user.username}
                        </button>
                        <span className="text-sm text-gray-500">
                            {formatTimestamp(activity.timestamp)}
                        </span>
                    </div>

                    <div className="text-gray-700">
                        {getActivityText()}
                    </div>
                </div>
            </div>
        </div>
    );
};
