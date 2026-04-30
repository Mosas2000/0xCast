/**
 * Analytics Service
 * 
 * Centralized service for tracking user behavior and platform metrics
 * Supports multiple analytics providers (Mixpanel, Amplitude, custom)
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface UserProperties {
  userId?: string;
  walletAddress?: string;
  email?: string;
  createdAt?: number;
  totalPredictions?: number;
  totalStaked?: number;
  winRate?: number;
  [key: string]: any;
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
  identify(userId: string, properties: UserProperties): void;
  setUserProperties(properties: UserProperties): void;
  reset(): void;
}

class MockAnalyticsProvider implements AnalyticsProvider {
  private events: AnalyticsEvent[] = [];
  private userProperties: Map<string, UserProperties> = new Map();

  track(event: AnalyticsEvent): void {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };
    this.events.push(eventWithTimestamp);
    console.debug('[Analytics]', event.name, event.properties);
  }

  identify(userId: string, properties: UserProperties): void {
    this.userProperties.set(userId, properties);
    console.debug('[Analytics] Identified user:', userId, properties);
  }

  setUserProperties(properties: UserProperties): void {
    console.debug('[Analytics] Set user properties:', properties);
  }

  reset(): void {
    this.events = [];
    this.userProperties.clear();
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }
}

export class AnalyticsService {
  private provider: AnalyticsProvider;
  private currentUserId: string | null = null;
  private sessionId: string;
  private isEnabled: boolean;

  constructor(provider?: AnalyticsProvider, enabled: boolean = true) {
    this.provider = provider || new MockAnalyticsProvider();
    this.sessionId = this.generateSessionId();
    this.isEnabled = enabled;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize analytics with user ID
   */
  initialize(userId: string, userProperties?: UserProperties): void {
    if (!this.isEnabled) return;

    this.currentUserId = userId;
    this.provider.identify(userId, {
      ...userProperties,
      sessionId: this.sessionId,
    });
  }

  /**
   * Track a user action
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.provider.track({
      name: eventName,
      properties: {
        ...properties,
        userId: this.currentUserId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Track market creation
   */
  trackMarketCreated(marketId: number, question: string, category: string): void {
    this.trackEvent('market_created', {
      marketId,
      question,
      category,
    });
  }

  /**
   * Track market prediction
   */
  trackPrediction(marketId: number, outcome: 'yes' | 'no', amount: number): void {
    this.trackEvent('prediction_made', {
      marketId,
      outcome,
      amount,
    });
  }

  /**
   * Track market resolution
   */
  trackMarketResolved(marketId: number, outcome: 'yes' | 'no' | 'disputed'): void {
    this.trackEvent('market_resolved', {
      marketId,
      outcome,
    });
  }

  /**
   * Track winnings claimed
   */
  trackWinningsClaimed(marketId: number, amount: number): void {
    this.trackEvent('winnings_claimed', {
      marketId,
      amount,
    });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>): void {
    this.trackEvent('page_view', {
      page: pageName,
      ...properties,
    });
  }

  /**
   * Track wallet connection
   */
  trackWalletConnected(walletType: string, address: string): void {
    this.trackEvent('wallet_connected', {
      walletType,
      address,
    });
  }

  /**
   * Track wallet disconnection
   */
  trackWalletDisconnected(): void {
    this.trackEvent('wallet_disconnected');
  }

  /**
   * Track error
   */
  trackError(errorName: string, errorMessage: string, context?: Record<string, any>): void {
    this.trackEvent('error_occurred', {
      errorName,
      errorMessage,
      ...context,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, properties?: Record<string, any>): void {
    this.trackEvent('feature_used', {
      feature: featureName,
      ...properties,
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search_performed', {
      query,
      resultsCount,
    });
  }

  /**
   * Track filter applied
   */
  trackFilterApplied(filterType: string, filterValue: string): void {
    this.trackEvent('filter_applied', {
      filterType,
      filterValue,
    });
  }

  /**
   * Track sort applied
   */
  trackSortApplied(sortBy: string, sortOrder: 'asc' | 'desc'): void {
    this.trackEvent('sort_applied', {
      sortBy,
      sortOrder,
    });
  }

  /**
   * Track time spent on page
   */
  trackTimeSpent(pageName: string, timeInSeconds: number): void {
    this.trackEvent('time_spent', {
      page: pageName,
      timeInSeconds,
    });
  }

  /**
   * Update user properties
   */
  updateUserProperties(properties: UserProperties): void {
    if (!this.isEnabled) return;

    this.provider.setUserProperties({
      userId: this.currentUserId || undefined,
      ...properties,
    });
  }

  /**
   * Reset analytics (logout)
   */
  reset(): void {
    this.currentUserId = null;
    this.sessionId = this.generateSessionId();
    this.provider.reset();
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
}

export function initializeAnalytics(provider?: AnalyticsProvider, enabled?: boolean): AnalyticsService {
  analyticsInstance = new AnalyticsService(provider, enabled);
  return analyticsInstance;
}
