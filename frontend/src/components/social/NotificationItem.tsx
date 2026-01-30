import React from 'react';
import { Notification } from '../../hooks/useNotifications';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    onClick?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    onClick,
}) => {
    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getTypeColor = () => {
        switch (notification.type) {
            case 'trade':
                return 'bg-green-50 border-green-200';
            case 'market_resolved':
                return 'bg-blue-50 border-blue-200';
            case 'comment_reply':
                return 'bg-purple-50 border-purple-200';
            case 'new_follower':
                return 'bg-pink-50 border-pink-200';
            case 'achievement':
                return 'bg-yellow-50 border-yellow-200';
            case 'price_alert':
                return 'bg-orange-50 border-orange-200';
            case 'market_ending':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div
            className={`relative p-4 rounded-lg border transition-all ${notification.read ? 'bg-white border-gray-200' : `${getTypeColor()} shadow-sm`
                } hover:shadow-md cursor-pointer`}
            onClick={onClick}
        >
            {!notification.read && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}

            <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{notification.icon || '📬'}</div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                    </div>

                    <p className="text-sm text-gray-700">{notification.message}</p>

                    <div className="flex items-center gap-3 mt-3">
                        {!notification.read && onMarkAsRead && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkAsRead(notification.id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Mark as read
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
