import React, { useEffect, useState } from 'react';
import { Notification } from '../types/notifications';
import { NotificationHelpers } from '../utils/notificationHelpers';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss(notification.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, notification.id, onDismiss]);

  if (!isVisible) return null;

  const priority = NotificationHelpers.getPriorityLabel(notification.type);
  const icon = NotificationHelpers.getIconForType(notification.type);

  const bgColor = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-blue-50 border-blue-200',
  }[priority];

  const borderColor = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
  }[priority];

  const textColor = {
    high: 'text-red-800',
    medium: 'text-yellow-800',
    low: 'text-blue-800',
  }[priority];

  const closeButtonColor = {
    high: 'hover:bg-red-100',
    medium: 'hover:bg-yellow-100',
    low: 'hover:bg-blue-100',
  }[priority];

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-md border-l-4 ${borderColor} ${bgColor} rounded-lg shadow-lg animate-slide-up`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 text-xl">{icon}</div>

        <div className="flex-1 ml-3">
          <p className={`font-semibold ${textColor}`}>{notification.title}</p>
          <p className={`text-sm mt-1 ${textColor}`}>{notification.message}</p>
          {notification.metadata?.marketName && (
            <p className={`text-xs mt-2 opacity-75 ${textColor}`}>{notification.metadata.marketName}</p>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss(notification.id);
          }}
          className={`flex-shrink-0 ml-3 p-1 rounded ${closeButtonColor} transition-colors`}
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {duration > 0 && (
        <div className={`h-0.5 bg-gradient-to-r ${priority === 'high' ? 'from-red-400' : priority === 'medium' ? 'from-yellow-400' : 'from-blue-400'} to-transparent`}
          style={{
            animation: `progress ${duration}ms linear forwards`,
          }}
        />
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
