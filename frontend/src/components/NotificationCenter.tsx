import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationStatus, NotificationType } from '@/types/notifications';

interface NotificationCenterProps {
  userId: string;
  onClose?: () => void;
}

type FilterStatus = NotificationStatus | 'all';

export default function NotificationCenter({
  userId,
  onClose,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    archive,
    delete: deleteNotification,
    bulkMarkAsRead,
  } = useNotifications(userId);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredNotifications =
    filterStatus === 'all'
      ? notifications
      : notifications.filter(n => n.status === filterStatus);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMarkSelectedAsRead = async () => {
    await bulkMarkAsRead(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case 'price_movement':
        return 'bg-blue-50';
      case 'market_expiry':
        return 'bg-orange-50';
      case 'resolution':
        return 'bg-green-50';
      case 'liquidity_reward':
        return 'bg-purple-50';
      case 'portfolio_update':
        return 'bg-indigo-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="border-b px-6 py-3 flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filterStatus === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filterStatus === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="border-b px-6 py-3 bg-blue-50 flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredNotifications.length}
                onChange={handleSelectAll}
              />
              <span className="text-sm text-gray-700">
                {selectedIds.size} selected
              </span>
            </label>
            <button
              onClick={handleMarkSelectedAsRead}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Mark as Read
            </button>
          </div>
        )}

        <div className="divide-y max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          )}

          {error && (
            <div className="p-6 bg-red-50 text-red-700 text-sm rounded-lg m-4">
              {error}
            </div>
          )}

          {!isLoading && filteredNotifications.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No notifications
            </div>
          )}

          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`px-6 py-4 hover:bg-gray-50 transition ${
                notification.status === 'unread' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(notification.id)}
                  onChange={() => handleToggleSelect(notification.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {notification.content.title}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        notification.status === 'unread'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {notification.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.content.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => archive(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
