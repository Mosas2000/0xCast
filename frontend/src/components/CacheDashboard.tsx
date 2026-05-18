import { useState, useEffect } from 'react';
import { cacheManager } from '../utils/cache';
import { marketCacheService } from '../services/MarketCacheService';

interface CacheStats {
  memoryCacheSize: number;
  sessionCacheSize: number;
  localCacheSize: number;
}

export function CacheDashboard() {
  const [stats, setStats] = useState<CacheStats>({
    memoryCacheSize: 0,
    sessionCacheSize: 0,
    localCacheSize: 0,
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const sessionKeys = Object.keys(sessionStorage).filter(k => k.startsWith('oxcast_cache_'));
      const localKeys = Object.keys(localStorage).filter(k => k.startsWith('oxcast_cache_'));

      setStats({
        memoryCacheSize: 0,
        sessionCacheSize: sessionKeys.length,
        localCacheSize: localKeys.length,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = (type: 'memory' | 'session' | 'local' | 'all') => {
    if (type === 'all') {
      cacheManager.clear();
      marketCacheService.invalidateAll();
    } else {
      cacheManager.clear(type);
    }
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors"
        aria-label="Open cache dashboard"
      >
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Cache Dashboard</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-500 hover:text-white"
          aria-label="Close cache dashboard"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Memory Cache</span>
          <span className="text-white">{stats.memoryCacheSize} items</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Session Cache</span>
          <span className="text-white">{stats.sessionCacheSize} items</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Local Cache</span>
          <span className="text-white">{stats.localCacheSize} items</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
        <button
          onClick={() => handleClearCache('memory')}
          className="w-full py-2 px-3 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors"
        >
          Clear Memory Cache
        </button>
        <button
          onClick={() => handleClearCache('all')}
          className="w-full py-2 px-3 text-sm bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded transition-colors"
        >
          Clear All Caches
        </button>
      </div>
    </div>
  );
}
