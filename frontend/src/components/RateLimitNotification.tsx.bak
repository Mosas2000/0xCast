import React from 'react';
import { formatTimeRemaining } from '@/utils/rateLimitHelpers';

interface RateLimitNotificationProps {
  message: string;
  retryAfter?: number;
  onDismiss?: () => void;
  type?: 'warning' | 'error' | 'info';
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  message,
  retryAfter,
  onDismiss,
  type = 'warning',
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`rate-limit-notification p-4 rounded-lg border ${getBackgroundColor()} mb-4`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColor()}`}>
            Rate Limit {type === 'error' ? 'Exceeded' : 'Warning'}
          </h3>
          <div className={`mt-2 text-sm ${getTextColor()}`}>
            <p>{message}</p>
            {retryAfter && retryAfter > 0 && (
              <p className="mt-1 font-medium">
                Please wait {formatTimeRemaining(retryAfter * 1000)} before trying again.
              </p>
            )}
          </div>
        </div>

        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:bg-opacity-20 focus:outline-none`}
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
