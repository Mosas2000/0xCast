import React, { useState } from 'react';
import { NotificationItem } from './NotificationItem';

interface NotificationCenterProps {
    userAddress?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userAddress }) => {
    // Mock notifications
    const [notifications] = useState([
        {
            id: 'n1',
            type: 'trade' as const,
            title: 'Trade Executed',
            message: 'Your trade on "BTC to $50k" was successful!',
            timestamp: Date.now() - 3600000,
            read: false,
            icon: '💰',
        },
        {
            id: 'n2',
            type: 'new_follower' as const,
            title: 'New Follower',
            message: 'CryptoTrader started following you',
            timestamp: Date.now() - 7200000,
            read: false,
            icon: '👥',
        },
    ]);

    const [unreadCount] = useState(2);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-sm rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Mark all as read
                    </button>
                </div>

                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </div>
            </div>
        </div>
    );
};
