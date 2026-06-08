export type EventPropertyValue = string | number | boolean | null | undefined;

export function isEventPropertyValue(value: unknown): value is EventPropertyValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, EventPropertyValue>;
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
  sessionId?: string;
  network?: string;
  theme?: string;
  language?: string;
  [key: string]: EventPropertyValue;
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

  initialize(userId: string, userProperties?: UserProperties): void {
    if (!this.isEnabled) return;

    this.currentUserId = userId;
    this.provider.identify(userId, {
      ...userProperties,
      sessionId: this.sessionId,
    });
  }

  trackEvent(eventName: string, properties?: Record<string, EventPropertyValue>): void {
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

  trackMarketCreated(marketId: number, question: string, category: string): void {
    this.trackEvent('market_created', {
      marketId,
      question,
      category,
    });
  }

  trackPrediction(marketId: number, outcome: 'yes' | 'no', amount: number): void {
    this.trackEvent('prediction_made', {
      marketId,
      outcome,
      amount,
    });
  }

  trackMarketResolved(marketId: number, outcome: 'yes' | 'no' | 'disputed'): void {
    this.trackEvent('market_resolved', {
      marketId,
      outcome,
    });
  }

  trackWinningsClaimed(marketId: number, amount: number): void {
    this.trackEvent('winnings_claimed', {
      marketId,
      amount,
    });
  }

  trackPageView(pageName: string, properties?: Record<string, EventPropertyValue>): void {
    this.trackEvent('page_view', {
      page: pageName,
      ...properties,
    });
  }

  trackWalletConnected(walletType: string, address: string): void {
    this.trackEvent('wallet_connected', {
      walletType,
      address,
    });
  }

  trackWalletDisconnected(): void {
    this.trackEvent('wallet_disconnected');
  }

  trackError(
    errorName: string,
    errorMessage: string,
    context?: Record<string, EventPropertyValue>
  ): void {
    this.trackEvent('error_occurred', {
      errorName,
      errorMessage,
      ...context,
    });
  }

  trackFeatureUsage(
    featureName: string,
    properties?: Record<string, EventPropertyValue>
  ): void {
    this.trackEvent('feature_used', {
      feature: featureName,
      ...properties,
    });
  }

  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search_performed', {
      query,
      resultsCount,
    });
  }

  trackFilterApplied(filterType: string, filterValue: string): void {
    this.trackEvent('filter_applied', {
      filterType,
      filterValue,
    });
  }

  trackSortApplied(sortBy: string, sortOrder: 'asc' | 'desc'): void {
    this.trackEvent('sort_applied', {
      sortBy,
      sortOrder,
    });
  }

  trackTimeSpent(pageName: string, timeInSeconds: number): void {
    this.trackEvent('time_spent', {
      page: pageName,
      timeInSeconds,
    });
  }

  updateUserProperties(properties: UserProperties): void {
    if (!this.isEnabled) return;

    this.provider.setUserProperties({
      userId: this.currentUserId || undefined,
      ...properties,
    });
  }

  reset(): void {
    this.currentUserId = null;
    this.sessionId = this.generateSessionId();
    this.provider.reset();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

let analyticsInstance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
}

export function initializeAnalytics(
  provider?: AnalyticsProvider,
  enabled?: boolean
): AnalyticsService {
  analyticsInstance = new AnalyticsService(provider, enabled);
  return analyticsInstance;
}
