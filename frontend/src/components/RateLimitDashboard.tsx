import React, { useState, useEffect } from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import { useWallet } from './WalletProvider';
import { RateLimitStatus } from './RateLimitStatus';

interface RateLimitStats {
  totalActions: number;
  blockedActions: number;
  activeWindows: number;
}

export const RateLimitDashboard: React.FC = () => {
  const { address } = useWallet();
  const { getAllRateLimits } = useRateLimit();
  const [limits, setLimits] = useState<Map<string, any>>(new Map());
  const [stats, setStats] = useState<RateLimitStats>({
    totalActions: 0,
    blockedActions: 0,
    activeWindows: 0,
  });

  useEffect(() => {
    if (!address) return;

    const updateLimits = () => {
      const allLimits = getAllRateLimits();
      setLimits(allLimits);

      let blocked = 0;
      let active = 0;
      const now = Date.now();

      allLimits.forEach((limit) => {
        if (limit.blocked) blocked++;
        if (now < limit.resetTime && limit.count > 0) active++;
      });

      setStats({
        totalActions: allLimits.size,
        blockedActions: blocked,
        activeWindows: active,
      });
    };

    updateLimits();
    const interval = setInterval(updateLimits, 5000);

    return () => clearInterval(interval);
  }, [address, getAllRateLimits]);

  if (!address) {
    return (
      <div className="rate-limit-dashboard p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Rate Limit Dashboard</h2>
        <p className="text-gray-500">Connect your wallet to view rate limits</p>
      </div>
    );
  }

  return (
    <div className="rate-limit-dashboard p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Rate Limit Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Actions</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalActions}</div>
        </div>

        <div className="stat-card p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Active Windows</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeWindows}</div>
        </div>

        <div className="stat-card p-4 bg-red-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Blocked Actions</div>
          <div className="text-2xl font-bold text-red-600">{stats.blockedActions}</div>
        </div>
      </div>

      <div className="limits-list space-y-4">
        <h3 className="text-lg font-semibold mb-3">Action Limits</h3>
        {Array.from(limits.entries()).map(([action, limit]) => (
          <div key={action} className="limit-item p-4 bg-gray-50 rounded-lg">
            <RateLimitStatus action={action} showDetails={true} />
          </div>
        ))}
      </div>

      {stats.blockedActions > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Rate Limit Warning</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You have {stats.blockedActions} action{stats.blockedActions !== 1 ? 's' : ''} currently blocked due to rate limits. 
                Please wait for the cooldown period to expire before trying again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
