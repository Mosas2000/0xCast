import React, { useState } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'trade' | 'market_update' | 'system';
    read: boolean;
    timestamp: string;
}

export const NotificationSystem: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Trade Executed',
            message: 'Your stake of 100 STX on "Yes" has been confirmed.',
            type: 'trade',
            read: false,
            timestamp: '2m ago',
        },
        {
            id: '2',
            title: 'Market Resolved',
            message: 'The market "BTC reach $100k?" has been resolved to "No".',
            type: 'market_update',
            read: true,
            timestamp: '1h ago',
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-slate-500 hover:text-primary-400 uppercase tracking-widest transition-colors"
                >
                    Mark all read
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-4 transition-colors relative group cursor-pointer ${n.read ? 'bg-transparent' : 'bg-primary-600/5'}`}
                        >
                            {!n.read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                            )}
                            <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-xs font-bold ${n.read ? 'text-slate-400' : 'text-white'}`}>
                                        {n.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 font-medium">{n.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                                    {n.message}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No notification yet
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-800/10 text-center">
                <button className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                    View Notification Settings
                </button>
            </div>
        </div>
    );
};
