import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoRefreshOptions {
    interval: number; // milliseconds
    enabled?: boolean;
    onRefresh?: () => void | Promise<void>;
}

interface UseAutoRefreshResult {
    isRefreshing: boolean;
    lastRefresh: Date | null;
    forceRefresh: () => Promise<void>;
}

/**
 * Hook that auto-refreshes data at a specified interval
 * Automatically pauses when the browser tab is inactive
 */
export function useAutoRefresh({
    interval,
    enabled = true,
    onRefresh,
}: UseAutoRefreshOptions): UseAutoRefreshResult {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [isTabActive, setIsTabActive] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    // Track tab visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsTabActive(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Force refresh function
    const forceRefresh = useCallback(async () => {
        if (isRefreshingRef.current || !onRefresh) return;

        isRefreshingRef.current = true;
        setIsRefreshing(true);

        try {
            await onRefresh();
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Auto-refresh error:', error);
        } finally {
            setIsRefreshing(false);
            isRefreshingRef.current = false;
        }
    }, [onRefresh]);

    // Set up auto-refresh interval
    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Only run if enabled and tab is active
        if (!enabled || !isTabActive || !onRefresh) {
            return;
        }

        // Initial refresh
        forceRefresh();

        // Set up interval
        intervalRef.current = setInterval(() => {
            if (!isRefreshingRef.current && isTabActive) {
                forceRefresh();
            }
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [interval, enabled, isTabActive, onRefresh, forceRefresh]);

    return {
        isRefreshing,
        lastRefresh,
        forceRefresh,
    };
}
