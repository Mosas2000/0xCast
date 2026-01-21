import { Notification, NotificationType } from '../types/notification';
import { getNotificationIcon } from '../utils/notificationHelpers';

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
    onDismiss: (id: string) => void;
    className?: string;
}

export function NotificationItem({ notification, onRead, onDismiss, className = '' }: NotificationItemProps) {
    const getTimeAgo = (timestamp: number) => {
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

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WIN:
            case NotificationType.CLAIM_AVAILABLE:
                return 'text-green-400 bg-green-500/10';
            case NotificationType.LOSS:
                return 'text-red-400 bg-red-500/10';
            case NotificationType.MARKET_ENDING_SOON:
                return 'text-orange-400 bg-orange-500/10';
            default:
                return 'text-primary-400 bg-primary-500/10';
        }
    };

    const handleClick = () => {
        if (!notification.read) {
            onRead(notification.id);
        }
        // Navigate to related item if metadata exists
        if (notification.metadata?.marketId) {
            // TODO: Navigate to market
            console.log('Navigate to market:', notification.metadata.marketId);
        }
    };

    return (
        <div
            className={`p-4 hover:bg-slate-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-slate-700/30' : ''
                } ${className}`.trim()}
            onClick={handleClick}
        >
            <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(notification.id);
                            }}
                            className="text-slate-500 hover:text-white transition-colors ml-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{notification.message}</p>
                    <p className="text-xs text-slate-500">{getTimeAgo(notification.timestamp)}</p>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                )}
            </div>
        </div>
    );
}
