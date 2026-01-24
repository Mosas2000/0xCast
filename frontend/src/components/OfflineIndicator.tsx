import React from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncPendingTransactions } = useOfflineSync();
  
  if (isOnline && pendingCount === 0) return null;
  
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40">
      <div className={`
        px-4 py-2 rounded-full shadow-lg flex items-center gap-2
        ${isOnline ? 'bg-yellow-600' : 'bg-red-600'}
      `}>
        {/* Status icon */}
        <div className="relative">
          {!isOnline && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          )}
          {isOnline && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        {/* Status text */}
        <span className="text-sm font-medium text-white">
          {!isOnline && 'Offline'}
          {isOnline && isSyncing && 'Syncing...'}
          {isOnline && !isSyncing && pendingCount > 0 && `${pendingCount} pending`}
        </span>
        
        {/* Sync button */}
        {isOnline && !isSyncing && pendingCount > 0 && (
          <button
            onClick={syncPendingTransactions}
            className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium text-white transition-colors"
          >
            Sync now
          </button>
        )}
      </div>
    </div>
  );
};
