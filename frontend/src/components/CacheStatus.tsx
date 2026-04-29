import { useState, useEffect } from 'react';

interface CacheStatusProps {
  isCached: boolean;
  lastUpdated?: number;
  className?: string;
}

export function CacheStatus({ isCached, lastUpdated, className = '' }: CacheStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = Date.now();
      const diff = now - lastUpdated;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(`${seconds}s ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!isCached) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
      <span className="text-neutral-500">
        Cached {timeAgo && `• ${timeAgo}`}
      </span>
    </div>
  );
}
