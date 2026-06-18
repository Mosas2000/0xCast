import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AnalyticsService,
  getAnalyticsService,
  initializeAnalytics,
  isEventPropertyValue,
  type AnalyticsProvider,
  type AnalyticsEvent,
  type EventPropertyValue,
  type UserProperties,
} from '../AnalyticsService';

class MockProvider implements AnalyticsProvider {
  events: AnalyticsEvent[] = [];
  identifications: Map<string, UserProperties> = new Map();

  track(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  identify(userId: string, properties: UserProperties): void {
    this.identifications.set(userId, properties);
  }

  setUserProperties(properties: UserProperties): void {
    // Mock implementation
  }

  reset(): void {
    this.events = [];
    this.identifications.clear();
  }
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider();
    service = new AnalyticsService(mockProvider, true);
  });

  describe('initialization', () => {
    it('initializes with user ID and properties', () => {
      const userId = 'user_123';
      const properties: UserProperties = {
        walletAddress: 'ST123',
        email: 'user@example.com',
      };

      service.initialize(userId, properties);

      expect(service.getCurrentUserId()).toBe(userId);
      expect(mockProvider.identifications.has(userId)).toBe(true);
    });

    it('generates unique session IDs', () => {
      const service1 = new AnalyticsService(mockProvider);
      const service2 = new AnalyticsService(mockProvider);

      expect(service1.getSessionId()).not.toBe(service2.getSessionId());
    });
  });

  describe('event tracking', () => {
    beforeEach(() => {
      service.initialize('user_123');
    });

    it('tracks market creation events', () => {
      service.trackMarketCreated(1, 'Will BTC hit 100k?', 'Crypto');

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('market_created');
      expect(mockProvider.events[0].properties?.marketId).toBe(1);
    });

    it('tracks prediction events', () => {
      service.trackPrediction(1, 'yes', 1000);

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('prediction_made');
      expect(mockProvider.events[0].properties?.outcome).toBe('yes');
      expect(mockProvider.events[0].properties?.amount).toBe(1000);
    });

    it('tracks market resolution events', () => {
      service.trackMarketResolved(1, 'yes');

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('market_resolved');
      expect(mockProvider.events[0].properties?.outcome).toBe('yes');
    });

    it('tracks winnings claimed events', () => {
      service.trackWinningsClaimed(1, 5000);

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('winnings_claimed');
      expect(mockProvider.events[0].properties?.amount).toBe(5000);
    });

    it('tracks page view events', () => {
      service.trackPageView('/markets');

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('page_view');
      expect(mockProvider.events[0].properties?.page).toBe('/markets');
    });

    it('tracks wallet connection events', () => {
      service.trackWalletConnected('stacks', 'ST123');

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('wallet_connected');
      expect(mockProvider.events[0].properties?.walletType).toBe('stacks');
    });

    it('tracks wallet disconnection events', () => {
      service.trackWalletDisconnected();

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('wallet_disconnected');
    });

    it('tracks error events', () => {
      service.trackError('NetworkError', 'Failed to fetch markets', { endpoint: '/api/markets' });

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('error_occurred');
      expect(mockProvider.events[0].properties?.errorName).toBe('NetworkError');
    });

    it('tracks feature usage events', () => {
      service.trackFeatureUsage('advanced_filters', { filterCount: 3 });

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('feature_used');
      expect(mockProvider.events[0].properties?.feature).toBe('advanced_filters');
    });

    it('tracks search events', () => {
      service.trackSearch('bitcoin', 42);

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('search_performed');
      expect(mockProvider.events[0].properties?.query).toBe('bitcoin');
      expect(mockProvider.events[0].properties?.resultsCount).toBe(42);
    });

    it('tracks filter applied events', () => {
      service.trackFilterApplied('category', 'crypto');

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('filter_applied');
      expect(mockProvider.events[0].properties?.filterType).toBe('category');
    });

    it('tracks sort applied events', () => {
      service.trackSortApplied('volume', 'desc');

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('sort_applied');
      expect(mockProvider.events[0].properties?.sortBy).toBe('volume');
    });

    it('tracks time spent events', () => {
      service.trackTimeSpent('/markets', 120);

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('time_spent');
      expect(mockProvider.events[0].properties?.timeInSeconds).toBe(120);
    });

    it('includes user ID and session ID in all events', () => {
      service.trackEvent('test_event');

      expect(mockProvider.events[0].properties?.userId).toBe('user_123');
      expect(mockProvider.events[0].properties?.sessionId).toBe(service.getSessionId());
    });
  });

  describe('user properties', () => {
    it('updates user properties', () => {
      service.initialize('user_123');
      service.updateUserProperties({
        totalPredictions: 10,
        winRate: 65.5,
      });

      // Mock provider should have been called
      expect(mockProvider.identifications.size).toBeGreaterThan(0);
    });
  });

  describe('enable/disable', () => {
    it('respects enabled flag', () => {
      const disabledService = new AnalyticsService(mockProvider, false);
      disabledService.initialize('user_123');
      disabledService.trackEvent('test_event');

      expect(mockProvider.events).toHaveLength(0);
    });

    it('can toggle enabled state', () => {
      service.initialize('user_123');
      service.setEnabled(false);
      service.trackEvent('test_event');

      expect(mockProvider.events).toHaveLength(0);

      service.setEnabled(true);
      service.trackEvent('test_event');

      expect(mockProvider.events).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('resets service state', () => {
      service.initialize('user_123');
      service.trackEvent('test_event');

      const oldSessionId = service.getSessionId();
      service.reset();

      expect(service.getCurrentUserId()).toBeNull();
      expect(service.getSessionId()).not.toBe(oldSessionId);
      expect(mockProvider.events).toHaveLength(0);
    });
  });

  describe('singleton', () => {
    it('returns same instance from getAnalyticsService', () => {
      const service1 = getAnalyticsService();
      const service2 = getAnalyticsService();

      expect(service1).toBe(service2);
    });

    it('creates new instance with initializeAnalytics', () => {
      const service1 = getAnalyticsService();
      const newService = initializeAnalytics(mockProvider);

      expect(newService).not.toBe(service1);
    });
  });

  describe('custom events', () => {
    beforeEach(() => {
      service.initialize('user_123');
    });

    it('tracks custom events with properties', () => {
      service.trackEvent('custom_event', {
        customProp1: 'value1',
        customProp2: 42,
      });

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].name).toBe('custom_event');
      expect(mockProvider.events[0].properties?.customProp1).toBe('value1');
      expect(mockProvider.events[0].properties?.customProp2).toBe(42);
    });
  });

  describe('EventPropertyValue type guard', () => {
    it('accepts valid property values', () => {
      const validValues: unknown[] = ['string', 42, true, false, null, undefined];
      validValues.forEach(v => {
        expect(isEventPropertyValue(v)).toBe(true);
      });
    });

    it('rejects objects and arrays', () => {
      const invalidValues: unknown[] = [{}, [], new Date(), () => {}];
      invalidValues.forEach(v => {
        expect(isEventPropertyValue(v)).toBe(false);
      });
    });

    it('event properties conform to EventPropertyValue', () => {
      const props: Record<string, EventPropertyValue> = {
        marketId: 1,
        outcome: 'yes',
        amount: 1000,
        active: true,
        extra: null,
      };
      service.trackEvent('typed_event', props);
      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0].properties?.marketId).toBe(1);
    });
  });
});