import React from 'react';
import { RateLimitStatus } from '@/types/rateLimit';

interface RateLimitBannerProps {
  status: RateLimitStatus;
  onDismiss?: () => void;
}

export const RateLimitBanner: React.FC<RateLimitBannerProps> = ({
  status,
  onDismiss,
}) => {
  if (!status.blocked && status.remaining > 2) {
    return null;
  }

  const getTimeRemaining = (timestamp: number): string => {
    const seconds = Math.ceil((timestamp - Date.now()) / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes ${remainingSeconds} seconds`;
  };

  const getBannerStyle = (): string => {
    if (status.blocked) return 'bg-red-100 border-red-400 text-red-800';
    return 'bg-yellow-100 border-yellow-400 text-yellow-800';
  };

  const getIcon = (): string => {
    if (status.blocked) return '🚫';
    return '⚠️';
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${getBannerStyle()}`} role="alert">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-bold">
            {status.blocked ? 'Rate Limit Exceeded' : 'Rate Limit Warning'}
          </p>
          <p className="text-sm mt-1">
            {status.blocked ? (
              <>
                You have exceeded the rate limit for {status.action}. Please wait{' '}
                {status.cooldownUntil && getTimeRemaining(status.cooldownUntil)} before
                trying again.
              </>
            ) : (
              <>
                You have {status.remaining} {status.action} request
                {status.remaining !== 1 ? 's' : ''} remaining. Limit resets in{' '}
                {getTimeRemaining(status.resetAt)}.
              </>
            )}
          </p>
        </div>
        {onDismiss && !status.blocked && (
          <button
            onClick={onDismiss}
            className="ml-4 text-lg font-bold hover:opacity-75"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
