import React from 'react';
import type { ReactNode } from 'react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

interface Props {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export const PullToRefresh: React.FC<Props> = ({ onRefresh, children }) => {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh(onRefresh);
  
  return (
    <div {...handlers} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
        style={{
          height: `${pullDistance}px`,
          opacity: Math.min(pullDistance / 80, 1)
        }}
      >
        <div className="flex flex-col items-center gap-2">
          {isRefreshing ? (
            <>
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Refreshing...</span>
            </>
          ) : (
            <>
              <svg
                className={`w-8 h-8 text-indigo-600 transition-transform ${
                  pullDistance > 80 ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="text-sm text-gray-400">
                {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};
