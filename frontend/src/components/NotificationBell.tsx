import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

interface NotificationBellProps {
  userId: string;
  className?: string;
}

export default function NotificationBell({
  userId,
  className = '',
}: NotificationBellProps) {
  const { unreadCount } = useNotifications(userId);
  const [showCenter, setShowCenter] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowCenter(!showCenter)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 transition ${className}`}
        aria-label="Notifications"
        aria-expanded={showCenter}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-end sm:justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 sm:max-h-screen overflow-hidden">
            <NotificationCenter
              userId={userId}
              onClose={() => setShowCenter(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
