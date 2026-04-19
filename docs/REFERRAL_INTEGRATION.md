# Referral System Integration Guide

## Overview

This guide explains how to integrate the 0xCast referral system into your application components.

## Setup

### 1. Deploy the Smart Contract

Deploy `contracts/referral-core.clar` to your network:

```bash
clarinet deploy --network mainnet
```

### 2. Initialize Tracking

Add to your app initialization code:

```typescript
import { ReferralMiddleware } from '@/utils/referralTracking';

// In your App.tsx or main.tsx
useEffect(() => {
  ReferralMiddleware.setupReferralTracking();
}, []);
```

### 3. Connect Contract

Update your contract configuration:

```typescript
// config/contracts.ts
export const referralContractAddress = 'SP...';
export const referralContractName = 'referral-core';
```

## Component Integration

### Homepage

Add referral card to homepage:

```typescript
import { ReferralCard } from '@/components/ReferralCard';

export function HomePage({ userAddress }: PageProps) {
  return (
    <div className="home-page">
      {/* Other content */}
      <ReferralCard 
        userAddress={userAddress} 
        appUrl="https://0xcast.app"
      />
    </div>
  );
}
```

### User Profile Page

Add full referral dashboard:

```typescript
import { ReferralDashboard } from '@/components/ReferralDashboard';

export function ProfilePage({ userAddress }: PageProps) {
  return (
    <div className="profile-page">
      <ReferralDashboard 
        userAddress={userAddress} 
        appUrl="https://0xcast.app"
      />
    </div>
  );
}
```

### Rewards Page

Display reward history:

```typescript
import { RewardHistory } from '@/components/RewardHistory';

export function RewardsPage({ userAddress }: PageProps) {
  return (
    <div className="rewards-page">
      <RewardHistory 
        userAddress={userAddress} 
        maxItems={20}
      />
    </div>
  );
}
```

## Market Integration

### Trigger Rewards on Prediction

When a user places a prediction:

```typescript
import { useReferralIntegration } from '@/hooks/useReferralIntegration';

function PredictionForm({ userAddress, onPredictionPlaced }: Props) {
  const { triggerRewardIfReferred } = useReferralIntegration(userAddress);

  const handlePredict = async (market: Market, prediction: Prediction) => {
    // Place the prediction
    const result = await contractCall.predict(market.id, prediction);
    
    // Trigger referral reward
    if (result.success) {
      await triggerRewardIfReferred(market, prediction);
      onPredictionPlaced(result);
    }
  };

  return (
    // Form JSX
  );
}
```

### Recording Rewards from Backend

When processing transactions on the backend:

```typescript
import { ReferralOperations } from '@/scripts/referral-operations';

async function processMarketPrediction(prediction: Prediction) {
  const referralOps = new ReferralOperations(config);
  
  // Check if user is referred
  const userInfo = await referralOps.getReferralInfo(prediction.user);
  
  if (userInfo.referrer) {
    // Record reward for referrer
    await referralOps.recordReward(
      userInfo.referrer,
      prediction.user,
      prediction.amount,
      'market-prediction',
      ownerAddress
    );
  }
}
```

## URL Parameter Handling

### Automatic Referral Registration

Users coming from a referral link are automatically tracked:

```
https://0xcast.app?ref=ABC123XYZ789
```

The system automatically:
1. Captures the referral code from URL
2. Saves it to localStorage
3. Shows in the referral dashboard
4. Validates when user registers

### Manual Registration

Allow users to register with a code after joining:

```typescript
import { ReferralCard } from '@/components/ReferralCard';

function JoinModal({ userAddress }: Props) {
  const { registerWithCode } = useReferral(userAddress);
  const [code, setCode] = useState('');

  const handleRegister = async () => {
    try {
      await registerWithCode(code);
      // Show success message
    } catch (error) {
      // Show error
    }
  };

  return (
    <div className="join-modal">
      <input 
        value={code} 
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter referral code"
      />
      <button onClick={handleRegister}>
        Register with Code
      </button>
    </div>
  );
}
```

## Analytics Integration

### Track Key Events

```typescript
import { ReferralTracker } from '@/utils/referralTracking';

// On code generation
const code = await generateCode();
ReferralTracker.trackReferralAction('code_generated', { code });

// On registration
await registerWithCode(code);
ReferralTracker.trackReferralAction('user_registered', { code });

// On reward claim
await claimRewards();
ReferralTracker.trackReferralAction('rewards_claimed', { amount });
```

### Google Analytics Setup

Add to your Google Tag Manager / Analytics:

```typescript
// events triggered:
gtag('event', 'referral_initialized', { source });
gtag('event', 'referral_registered', { referral_code });
gtag('event', 'referral_reward_triggered', { action_type });
gtag('event', 'referral_claimed_rewards', { amount });
```

## Styling

Import referral styles in your global CSS:

```css
/* For TailwindCSS, add to tailwind.config.js */
module.exports = {
  content: [
    './src/components/Referral*.tsx',
    './src/components/Reward*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        referral: {
          primary: '#4F46E5',
          success: '#10B981',
          warning: '#F59E0B',
        }
      }
    }
  }
}
```

Or create your own stylesheet:

```css
/* styles/referral.css */

.referral-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 24px;
  color: white;
}

.referral-card {
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
}

.reward-history__table {
  width: 100%;
  border-collapse: collapse;
}

.reward-history__table-cell {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}
```

## Error Handling

Implement error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ReferralErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <p>Referral system error:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function ReferralDashboardPage() {
  return (
    <ErrorBoundary FallbackComponent={ReferralErrorFallback}>
      <ReferralDashboard userAddress={userAddress} appUrl={appUrl} />
    </ErrorBoundary>
  );
}
```

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useReferral } from '@/hooks/useReferral';

describe('useReferral', () => {
  it('should generate referral code', async () => {
    const { result } = renderHook(() => useReferral('ST123...'));
    
    await act(async () => {
      await result.current.generateCode();
    });
    
    expect(result.current.referralCode).toBeDefined();
  });
});
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { ReferralDashboard } from '@/components/ReferralDashboard';

describe('ReferralDashboard', () => {
  it('should render dashboard for connected user', () => {
    render(
      <ReferralDashboard 
        userAddress="ST123..." 
        appUrl="https://test.app"
      />
    );
    
    expect(screen.getByText(/Referral/i)).toBeInTheDocument();
  });
});
```

## Deployment Checklist

- [ ] Deploy smart contracts to mainnet
- [ ] Update contract addresses in configuration
- [ ] Add referral tracking initialization
- [ ] Integrate referral components in UI
- [ ] Set up backend reward recording
- [ ] Configure analytics tracking
- [ ] Test end-to-end referral flow
- [ ] Set up monitoring and alerts
- [ ] Document team integration
- [ ] Plan marketing campaign

## Support and Troubleshooting

### Common Issues

**Issue**: Referral code not being saved
- Solution: Check localStorage is enabled
- Check `getReferralCodeFromUrl()` is called on page load

**Issue**: Rewards not being recorded
- Solution: Verify contract owner is set correctly
- Check action amount meets minimum threshold

**Issue**: Dashboard not loading
- Solution: Verify user address is valid
- Check contract address in configuration

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem('debug_referral', 'true');
```

This will log all referral operations to console.

## Best Practices

1. **Always validate referral codes** before processing
2. **Set minimum reward thresholds** to prevent spam
3. **Monitor affiliate payouts** for fraud patterns
4. **Back up referral data** regularly
5. **Test extensively** before production deployment
6. **Document all integrations** for your team
7. **Keep smart contract versions** consistent
8. **Monitor gas costs** for reward transactions

## Next Steps

After integration:
1. Launch referral marketing campaign
2. Monitor key metrics (conversion, retention)
3. Adjust reward rates based on performance
4. Gather user feedback
5. Iterate on UI/UX
6. Plan expansion features (affiliates tiers, leaderboards)
