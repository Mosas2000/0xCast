import React from 'react';
import { useRateLimit } from '../hooks/useRateLimit';

interface RateLimitStatusProps {
  action: string;
  showDetails?: boolean;
}

export const RateLimitStatus: React.FC<RateLimitStatusProps> = ({ 
  action, 
  showDetails = false 
}) => {
  const { getRateLimitStatus } = useRateLimit();
  const status = getRateLimitStatus(action);

  if (!status || status.limit === 0) {
    return null;
  }

  const percentage = (status.remaining / status.limit) * 100;
  const resetDate = new Date(status.resetTime);
  const now = Date.now();
  const timeUntilReset = Math.max(0, status.resetTime - now);
  const minutesUntilReset = Math.ceil(timeUntilReset / 60000);

  const getStatusColor = () => {
    if (status.blocked) return 'text-red-600';
    if (percentage < 20) return 'text-orange-600';
    if (percentage < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (status.blocked) return 'bg-red-500';
    if (percentage < 20) return 'bg-orange-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="rate-limit-status">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {action.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
        <span className={`text-sm font-semibold ${getStatusColor()}`}>
          {status.remaining}/{status.limit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="text-xs text-gray-500">
          {status.blocked ? (
            <span className="text-red-600 font-medium">
              Rate limit exceeded. Try again in {minutesUntilReset} minute{minutesUntilReset !== 1 ? 's' : ''}
            </span>
          ) : (
            <span>
              Resets in {minutesUntilReset} minute{minutesUntilReset !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
