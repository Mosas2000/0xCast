import { Notification } from '../types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
    notifications: Notification[];
    onRead: (id: string) => void;
    onDismiss: (id: string) => void;
    onMarkAllRead: () => void;
    onClearAll: () => void;
    className?: string;
}

export function NotificationList({
    notifications,
    onRead,
    onDismiss,
    onMarkAllRead,
    onClearAll,
    className = '',
}: NotificationListProps) {
    const groupByDate = (notifs: Notification[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;

        const groups: { [key: string]: Notification[] } = {
            Today: [],
            Yesterday: [],
            Earlier: [],
        };

        notifs.forEach((notif) => {
            const notifDate = new Date(notif.timestamp).setHours(0, 0, 0, 0);
            if (notifDate === today) {
                groups.Today.push(notif);
            } else if (notifDate === yesterday) {
                groups.Yesterday.push(notif);
            } else {
                groups.Earlier.push(notif);
            }
        });

        return groups;
    };

    const grouped = groupByDate(notifications);
    const hasUnread = notifications.some((n) => !n.read);

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                <div className="flex items-center space-x-2">
                    {hasUnread && (
                        <button
                            onClick={onMarkAllRead}
                            className="px-3 py-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={onClearAll}
                        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>No notifications</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([group, notifs]) => {
                        if (notifs.length === 0) return null;
                        return (
                            <div key={group}>
                                <h3 className="text-sm font-medium text-slate-400 mb-2">{group}</h3>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden divide-y divide-slate-700">
                                    {notifs.map((notif) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notification={notif}
                                            onRead={onRead}
                                            onDismiss={onDismiss}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
