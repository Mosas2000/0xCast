# Analytics Implementation Guide

## Overview

This document describes the comprehensive analytics system implemented for the 0xCast platform. The system tracks user behavior, market trends, revenue metrics, and provides GDPR-compliant data handling.

## Architecture

### Components

1. **AnalyticsService** - Core service for event tracking
2. **GDPRComplianceService** - Privacy and consent management
3. **useAnalyticsTracking** - React hook for tracking
4. **AdminAnalyticsDashboard** - Admin interface for metrics
5. **GDPRConsentBanner** - User consent UI
6. **AnalyticsPage** - Public analytics dashboard

### Data Flow

```
User Action
    ↓
useAnalyticsTracking Hook
    ↓
AnalyticsService.trackEvent()
    ↓
Analytics Provider (Mock/Mixpanel/Amplitude)
    ↓
Storage/Backend
```

## Features

### 1. Event Tracking

The system tracks the following events:

#### Market Events
- `market_created` - When a new market is created
- `market_resolved` - When a market is resolved
- `prediction_made` - When a user makes a prediction
- `winnings_claimed` - When a user claims winnings

#### User Events
- `wallet_connected` - When wallet is connected
- `wallet_disconnected` - When wallet is disconnected
- `page_view` - When user navigates to a page
- `time_spent` - When user leaves a page

#### Interaction Events
- `search_performed` - When user searches
- `filter_applied` - When user applies filters
- `sort_applied` - When user sorts data
- `feature_used` - When user uses a feature
- `error_occurred` - When an error happens

### 2. User Behavior Tracking

The system tracks:
- User demographics (wallet address, email)
- Prediction history
- Win/loss statistics
- Time spent on pages
- Feature usage patterns
- Search queries and filters

### 3. Revenue Metrics

Tracked metrics include:
- Total protocol fees collected
- Average order value
- Revenue per user
- Revenue by category
- Revenue by user segment
- Conversion rates

### 4. Leaderboards

The system maintains leaderboards showing:
- Top predictors by win rate
- Top predictors by total staked
- Top predictors by net P&L
- Most active users
- Newest users

### 5. GDPR Compliance

Features include:
- Explicit user consent management
- Data export functionality (right to data portability)
- Data deletion functionality (right to be forgotten)
- Data anonymization
- Consent versioning
- Data retention policies

## Usage

### Basic Event Tracking

```typescript
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

function MyComponent() {
  const { trackEvent, trackPrediction } = useAnalyticsTracking();

  const handlePrediction = (marketId: number, outcome: 'yes' | 'no', amount: number) => {
    // Make prediction...
    trackPrediction(marketId, outcome, amount);
  };

  return (
    <button onClick={() => handlePrediction(1, 'yes', 1000)}>
      Predict Yes
    </button>
  );
}
```

### Direct Service Usage

```typescript
import { getAnalyticsService } from '@/services/AnalyticsService';

const analytics = getAnalyticsService();

// Initialize with user
analytics.initialize('user_123', {
  walletAddress: 'ST123...',
  email: 'user@example.com',
});

// Track events
analytics.trackMarketCreated(1, 'Will BTC hit 100k?', 'Crypto');
analytics.trackPrediction(1, 'yes', 1000);
analytics.trackPageView('/markets');
```

### GDPR Consent Management

```typescript
import { GDPRComplianceService } from '@/services/GDPRComplianceService';

// Check if analytics is enabled
if (GDPRComplianceService.isAnalyticsEnabled()) {
  // Enable analytics
}

// Accept all consent
GDPRComplianceService.acceptAll();

// Export user data
const userData = await GDPRComplianceService.exportUserData('user_123');

// Delete user data
await GDPRComplianceService.deleteUserData('user_123');
```

## Integration Points

### 1. Market Creation

Track when markets are created:

```typescript
// In MarketCreationWizard or similar
const { trackMarketCreated } = useAnalyticsTracking();

const handleCreateMarket = async (question: string, category: string) => {
  const marketId = await createMarket(question, category);
  trackMarketCreated(marketId, question, category);
};
```

### 2. Predictions

Track when users make predictions:

```typescript
// In TradePage or similar
const { trackPrediction } = useAnalyticsTracking();

const handleStake = async (marketId: number, outcome: 'yes' | 'no', amount: number) => {
  await stakeOnMarket(marketId, outcome, amount);
  trackPrediction(marketId, outcome, amount);
};
```

### 3. Market Resolution

Track when markets are resolved:

```typescript
// In resolution logic
const { trackMarketResolved } = useAnalyticsTracking();

const handleResolveMarket = async (marketId: number, outcome: 'yes' | 'no') => {
  await resolveMarket(marketId, outcome);
  trackMarketResolved(marketId, outcome);
};
```

### 4. Winnings Claims

Track when users claim winnings:

```typescript
// In winnings claim logic
const { trackWinningsClaimed } = useAnalyticsTracking();

const handleClaimWinnings = async (marketId: number, amount: number) => {
  await claimWinnings(marketId, amount);
  trackWinningsClaimed(marketId, amount);
};
```

## Admin Dashboard

Access the admin analytics dashboard at `/admin/analytics` (when admin role is enabled).

Features:
- **Overview Tab**: Platform-wide metrics and charts
- **User Behavior Tab**: User metrics and conversion funnel
- **Revenue Tab**: Revenue breakdown and metrics
- **Leaderboard Tab**: Top predictors and rankings

## Analytics Providers

The system supports multiple analytics providers:

### Mock Provider (Default)

Used for development and testing. Logs events to console.

```typescript
import { AnalyticsService } from '@/services/AnalyticsService';

const service = new AnalyticsService(); // Uses MockProvider by default
```

### Mixpanel Integration

To integrate with Mixpanel:

```typescript
import { AnalyticsService } from '@/services/AnalyticsService';
import mixpanel from 'mixpanel-browser';

class MixpanelProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent): void {
    mixpanel.track(event.name, event.properties);
  }

  identify(userId: string, properties: UserProperties): void {
    mixpanel.identify(userId);
    mixpanel.people.set(properties);
  }

  setUserProperties(properties: UserProperties): void {
    mixpanel.people.set(properties);
  }

  reset(): void {
    mixpanel.reset();
  }
}

const service = new AnalyticsService(new MixpanelProvider());
```

### Amplitude Integration

To integrate with Amplitude:

```typescript
import { AnalyticsService } from '@/services/AnalyticsService';
import * as amplitude from '@amplitude/analytics-browser';

class AmplitudeProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent): void {
    amplitude.track(event.name, event.properties);
  }

  identify(userId: string, properties: UserProperties): void {
    amplitude.setUserId(userId);
    amplitude.identify(new amplitude.Identify().setUserProperties(properties));
  }

  setUserProperties(properties: UserProperties): void {
    amplitude.identify(new amplitude.Identify().setUserProperties(properties));
  }

  reset(): void {
    amplitude.reset();
  }
}

const service = new AnalyticsService(new AmplitudeProvider());
```

## Privacy & GDPR Compliance

### Consent Banner

The GDPR consent banner is displayed to users on first visit. Users can:
- Accept all analytics
- Reject all analytics
- Customize preferences

```typescript
import { GDPRConsentBanner } from '@/components/GDPRConsentBanner';

function App() {
  return (
    <>
      <GDPRConsentBanner />
      {/* Rest of app */}
    </>
  );
}
```

### Data Rights

Users can exercise their GDPR rights:

1. **Right to Access**: Export personal data
2. **Right to Erasure**: Delete personal data
3. **Right to Rectification**: Update personal data
4. **Right to Data Portability**: Export data in standard format

### Data Retention

- Analytics data is retained for 90 days by default
- User can request deletion at any time
- Deleted data is anonymized before removal

## Testing

### Unit Tests

Run analytics service tests:

```bash
npm run test -- AnalyticsService.test.ts
npm run test -- GDPRComplianceService.test.ts
```

### Integration Tests

Test analytics integration in components:

```typescript
import { render, screen } from '@testing-library/react';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

test('tracks prediction event', () => {
  const { trackPrediction } = useAnalyticsTracking();
  trackPrediction(1, 'yes', 1000);
  // Assert event was tracked
});
```

## Configuration

### Environment Variables

```env
# Enable/disable analytics
VITE_ANALYTICS_ENABLED=true

# Analytics provider (mock, mixpanel, amplitude)
VITE_ANALYTICS_PROVIDER=mock

# Mixpanel token
VITE_MIXPANEL_TOKEN=your_token_here

# Amplitude API key
VITE_AMPLITUDE_API_KEY=your_key_here
```

### Runtime Configuration

```typescript
import { initializeAnalytics } from '@/services/AnalyticsService';
import { GDPRComplianceService } from '@/services/GDPRComplianceService';

// Initialize analytics
const analyticsEnabled = GDPRComplianceService.isAnalyticsEnabled();
initializeAnalytics(undefined, analyticsEnabled);
```

## Metrics & KPIs

### Platform Metrics
- Total markets created
- Total volume traded
- Total predictions made
- Total fees collected
- Active users
- New users
- User retention rate

### User Metrics
- Predictions per user
- Win rate
- Average stake
- Net P&L
- Time spent on platform
- Feature usage

### Market Metrics
- Markets by category
- Average pool size
- Market resolution rate
- Dispute rate
- Market popularity

## Best Practices

1. **Always check consent before tracking**
   ```typescript
   if (GDPRComplianceService.isAnalyticsEnabled()) {
     analytics.trackEvent('event_name');
   }
   ```

2. **Use meaningful event names**
   - Use snake_case for event names
   - Be specific about what happened
   - Include context in properties

3. **Avoid tracking sensitive data**
   - Don't track private keys
   - Don't track passwords
   - Don't track full wallet balances

4. **Batch events when possible**
   - Group related events
   - Reduce network calls
   - Improve performance

5. **Test analytics integration**
   - Verify events are tracked
   - Check event properties
   - Monitor for errors

## Troubleshooting

### Events not being tracked

1. Check if analytics is enabled
   ```typescript
   console.log(GDPRComplianceService.isAnalyticsEnabled());
   ```

2. Check browser console for errors
3. Verify analytics service is initialized
4. Check network tab for API calls

### Consent banner not showing

1. Clear localStorage
2. Check if consent already exists
3. Verify component is mounted
4. Check for CSS conflicts

### Data export failing

1. Verify user ID is correct
2. Check backend API is responding
3. Check for CORS issues
4. Verify user has permission

## Future Enhancements

1. **Real-time dashboards** - WebSocket updates
2. **Custom reports** - User-defined metrics
3. **Predictive analytics** - ML-based insights
4. **Cohort analysis** - User segmentation
5. **A/B testing** - Experiment framework
6. **Advanced filtering** - Complex queries
7. **Data visualization** - More chart types
8. **Alerts** - Anomaly detection

## References

- [GDPR Compliance Guide](https://gdpr-info.eu/)
- [Mixpanel Documentation](https://developer.mixpanel.com/)
- [Amplitude Documentation](https://www.docs.developers.amplitude.com/)
- [Privacy by Design](https://www.privacybydesign.ca/)

## Support

For questions or issues with analytics:
1. Check this documentation
2. Review test files for examples
3. Check GitHub issues
4. Contact development team
