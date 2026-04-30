import React from 'react';
import { useAllRateLimits } from '@/hooks/useRateLimit';
import { RateLimitStatus } from './RateLimitStatus';
import { RateLimitAction } from '@/types/rateLimit';

interface RateLimitDashboardProps {
  userId: string;
}

const ACTION_LABELS: Record<RateLimitAction, string> = {
  'stake': 'Staking',
  'create-market': 'Market Creation',
  'resolve-market': 'Market Resolution',
  'add-liquidity': 'Add Liquidity',
  'remove-liquidity': 'Remove Liquidity',
  'vote': 'Voting',
  'claim-rewards': 'Claim Rewards',
  'dispute': 'Dispute',
  'trade': 'Trading',
};

export const RateLimitDashboard: React.FC<RateLimitDashboardProps> = ({ userId }) => {
  const { statuses, loading, refreshStatuses } = useAllRateLimits(userId);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Rate Limit Status</h2>
        <button
          onClick={refreshStatuses}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {statuses.map((status) => (
          <div
            key={status.action}
            className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
          >
            <span className="font-medium">{ACTION_LABELS[status.action]}</span>
            <RateLimitStatus status={status} />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <p className="font-medium mb-1">Rate Limit Information</p>
        <p>
          Rate limits help prevent abuse and ensure fair usage. If you exceed a limit,
          you'll need to wait for the cooldown period to expire.
        </p>
      </div>
    </div>
  );
};
