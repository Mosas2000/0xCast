/**
 * Analytics Tracking Hook
 * 
 * Provides utilities for tracking user behavior throughout the application
 */

import { useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { getAnalyticsService } from '@/services/AnalyticsService';

export function useAnalyticsTracking() {
  const { address, isConnected } = useWallet();
  const analyticsService = getAnalyticsService();
  const pageStartTimeRef = useRef<number>(Date.now());
  const userInitializedRef = useRef<boolean>(false);

  // Initialize analytics when wallet connects
  useEffect(() => {
    if (isConnected && address && !userInitializedRef.current) {
      analyticsService.initialize(address, {
        walletAddress: address,
      });
      analyticsService.trackWalletConnected('stacks', address);
      userInitializedRef.current = true;
    } else if (!isConnected && userInitializedRef.current) {
      analyticsService.trackWalletDisconnected();
      analyticsService.reset();
      userInitializedRef.current = false;
    }
  }, [isConnected, address, analyticsService]);

  // Track page view on mount
  useEffect(() => {
    const pageName = window.location.pathname;
    analyticsService.trackPageView(pageName);
    pageStartTimeRef.current = Date.now();

    // Track time spent on page on unmount
    return () => {
      const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      if (timeSpent > 0) {
        analyticsService.trackTimeSpent(pageName, timeSpent);
      }
    };
  }, [analyticsService]);

  // Track market creation
  const trackMarketCreated = useCallback(
    (marketId: number, question: string, category: string) => {
      analyticsService.trackMarketCreated(marketId, question, category);
    },
    [analyticsService]
  );

  // Track prediction
  const trackPrediction = useCallback(
    (marketId: number, outcome: 'yes' | 'no', amount: number) => {
      analyticsService.trackPrediction(marketId, outcome, amount);
    },
    [analyticsService]
  );

  // Track market resolution
  const trackMarketResolved = useCallback(
    (marketId: number, outcome: 'yes' | 'no' | 'disputed') => {
      analyticsService.trackMarketResolved(marketId, outcome);
    },
    [analyticsService]
  );

  // Track winnings claimed
  const trackWinningsClaimed = useCallback(
    (marketId: number, amount: number) => {
      analyticsService.trackWinningsClaimed(marketId, amount);
    },
    [analyticsService]
  );

  // Track search
  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      analyticsService.trackSearch(query, resultsCount);
    },
    [analyticsService]
  );

  // Track filter applied
  const trackFilterApplied = useCallback(
    (filterType: string, filterValue: string) => {
      analyticsService.trackFilterApplied(filterType, filterValue);
    },
    [analyticsService]
  );

  // Track sort applied
  const trackSortApplied = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      analyticsService.trackSortApplied(sortBy, sortOrder);
    },
    [analyticsService]
  );

  const trackFeatureUsage = useCallback(
    (featureName: string, properties?: Record<string, EventPropertyValue>) => {
      analyticsService.trackFeatureUsage(featureName, properties);
    },
    [analyticsService]
  );

  const trackError = useCallback(
    (errorName: string, errorMessage: string, context?: Record<string, EventPropertyValue>) => {
      analyticsService.trackError(errorName, errorMessage, context);
    },
    [analyticsService]
  );

  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, EventPropertyValue>) => {
      analyticsService.trackEvent(eventName, properties);
    },
    [analyticsService]
  );

  const updateUserProperties = useCallback(
    (properties: Record<string, EventPropertyValue>) => {
      analyticsService.updateUserProperties(properties);
    },
    [analyticsService]
  );

  return {
    trackMarketCreated,
    trackPrediction,
    trackMarketResolved,
    trackWinningsClaimed,
    trackSearch,
    trackFilterApplied,
    trackSortApplied,
    trackFeatureUsage,
    trackError,
    trackEvent,
    updateUserProperties,
  };
}
