# Referral System Example Implementation

This document provides practical examples for integrating the referral system into your 0xCast application.

## Basic Setup Example

### 1. Initialize on App Load

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { ReferralMiddleware } from '@/utils/referralTracking';
import { isReferralSystemEnabled } from '@/config/referralConfig';

function App() {
  useEffect(() => {
    if (isReferralSystemEnabled()) {
      ReferralMiddleware.setupReferralTracking();
    }
  }, []);

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

### 2. Add Referral Card to Homepage

```typescript
// src/pages/HomePage.tsx
import { ReferralCard } from '@/components/ReferralCard';
import { useAuth } from '@/hooks/useAuth';

export function HomePage() {
  const { address: userAddress } = useAuth();
  const appUrl = process.env.REACT_APP_URL || 'https://0xcast.app';

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to 0xCast</h1>
        <p>Predict, Trade, and Earn Rewards</p>
      </section>

      {userAddress && (
        <section className="referral-section">
          <ReferralCard 
            userAddress={userAddress} 
            appUrl={appUrl}
          />
        </section>
      )}

      {/* Rest of homepage */}
    </div>
  );
}
```

## Market Integration Example

### Record Reward on Prediction

```typescript
// src/hooks/usePredictionWithReferral.ts
import { useCallback } from 'react';
import { useReferralIntegration } from '@/hooks/useReferralIntegration';
import { ReferralTracker } from '@/utils/referralTracking';

export function usePredictionWithReferral(userAddress: string | null) {
  const { triggerRewardIfReferred } = useReferralIntegration(userAddress);

  const makePrediction = useCallback(
    async (market: Market, outcome: Outcome, amount: number) => {
      try {
        // Execute prediction on contract
        const result = await contractCall.predict(market.id, outcome, amount);

        if (result.success) {
          // Trigger referral reward if user was referred
          await triggerRewardIfReferred(market, { outcome, amount });

          // Track the action
          ReferralTracker.trackReferralAction('prediction_placed', {
            marketId: market.id,
            amount,
          });

          return result;
        }
      } catch (error) {
        console.error('Prediction failed:', error);
        throw error;
      }
    },
    [userAddress, triggerRewardIfReferred]
  );

  return { makePrediction };
}
```

### Usage in Component

```typescript
// src/components/PredictionForm.tsx
import { usePredictionWithReferral } from '@/hooks/usePredictionWithReferral';

function PredictionForm({ market, userAddress }: Props) {
  const { makePrediction } = usePredictionWithReferral(userAddress);
  const [amount, setAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOutcome || !amount) return;

    try {
      const result = await makePrediction(
        market,
        selectedOutcome,
        parseFloat(amount)
      );

      if (result.success) {
        // Show success message
        showNotification('Prediction placed successfully!');
        setAmount('');
        setSelectedOutcome(null);
      }
    } catch (error) {
      showNotification('Failed to place prediction', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Select Outcome</label>
        <div className="outcome-buttons">
          <button
            type="button"
            className={`outcome-btn ${selectedOutcome === 'yes' ? 'active' : ''}`}
            onClick={() => setSelectedOutcome('yes')}
          >
            Yes
          </button>
          <button
            type="button"
            className={`outcome-btn ${selectedOutcome === 'no' ? 'active' : ''}`}
            onClick={() => setSelectedOutcome('no')}
          >
            No
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Amount (OXC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>

      <button type="submit" className="btn-primary">
        Place Prediction
      </button>
    </form>
  );
}
```

## Referral Dashboard Example

### Full Dashboard Page

```typescript
// src/pages/AffiliatesDashboardPage.tsx
import { ReferralDashboard } from '@/components/ReferralDashboard';
import { RewardHistory } from '@/components/RewardHistory';
import { ReferralInvitation } from '@/components/ReferralInvitation';
import { useAuth } from '@/hooks/useAuth';

export function AffiliatesDashboardPage() {
  const { address: userAddress } = useAuth();
  const appUrl = process.env.REACT_APP_URL || 'https://0xcast.app';

  if (!userAddress) {
    return (
      <div className="page-content">
        <p>Please connect your wallet to view your affiliate dashboard</p>
      </div>
    );
  }

  return (
    <div className="page-content affiliates-dashboard">
      <h1>Affiliate Dashboard</h1>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <ReferralDashboard 
            userAddress={userAddress} 
            appUrl={appUrl}
          />
        </section>

        <section className="dashboard-section">
          <ReferralInvitation 
            referralCode={userAddress}
            onInvitationSent={(method) => {
              console.log(`Invitation sent via ${method}`);
            }}
          />
        </section>

        <section className="dashboard-section full-width">
          <RewardHistory 
            userAddress={userAddress} 
            maxItems={20}
          />
        </section>
      </div>
    </div>
  );
}
```

## Backend Integration Example

### Recording Rewards from Market Events

```typescript
// backend/services/referralService.ts
import { ReferralOperations } from '@/scripts/referral-operations';

class ReferralService {
  private referralOps: ReferralOperations;

  constructor() {
    this.referralOps = new ReferralOperations({
      contractAddress: process.env.REFERRAL_CONTRACT_ADDRESS!,
      network: process.env.NETWORK as any,
    });
  }

  async processPredictionReward(
    predictingUser: string,
    predictionAmount: number
  ): Promise<void> {
    try {
      // Get user's referral info
      const referralInfo = await this.referralOps.getReferralInfo(predictingUser);

      if (referralInfo && referralInfo.referrer) {
        // Record reward for referrer
        await this.referralOps.recordReward(
          referralInfo.referrer,
          predictingUser,
          predictionAmount,
          'market-prediction',
          process.env.CONTRACT_OWNER!
        );

        console.log(
          `Recorded reward for ${referralInfo.referrer} from user ${predictingUser}`
        );
      }
    } catch (error) {
      console.error('Error processing prediction reward:', error);
      // Don't fail the prediction if reward recording fails
    }
  }

  async processBatchRewards(rewards: Array<{
    referrer: string;
    referredUser: string;
    amount: number;
    actionType: string;
  }>): Promise<void> {
    try {
      await this.referralOps.processBatchRewards(
        rewards,
        process.env.CONTRACT_OWNER!
      );

      console.log(`Processed ${rewards.length} batch rewards`);
    } catch (error) {
      console.error('Error processing batch rewards:', error);
      throw error;
    }
  }

  async generateAffiliateReport(): Promise<void> {
    try {
      await this.referralOps.exportAffiliateReport();
      console.log('Affiliate report generated');
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}

export const referralService = new ReferralService();
```

### Market Prediction API

```typescript
// backend/api/predictions.ts
import { Express } from 'express';
import { referralService } from '@/services/referralService';

export function setupPredictionRoutes(app: Express) {
  app.post('/api/predictions', async (req, res) => {
    try {
      const { marketId, outcome, amount, userAddress } = req.body;

      // Validate inputs
      if (!marketId || !outcome || !amount || !userAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create prediction in database
      const prediction = await db.predictions.create({
        marketId,
        outcome,
        amount,
        userAddress,
        createdAt: new Date(),
      });

      // Process referral reward
      await referralService.processPredictionReward(userAddress, amount);

      res.json({
        success: true,
        prediction,
      });
    } catch (error) {
      console.error('Error creating prediction:', error);
      res.status(500).json({ error: 'Failed to create prediction' });
    }
  });
}
```

## Advanced Examples

### Custom Affiliate Analytics

```typescript
// src/hooks/useAffiliateAnalytics.ts
import { useQuery } from '@tanstack/react-query';

export function useAffiliateAnalytics(userAddress: string | null) {
  return useQuery({
    queryKey: ['affiliateAnalytics', userAddress],
    queryFn: async () => {
      if (!userAddress) return null;

      const response = await fetch(`/api/affiliates/${userAddress}/analytics`);
      return response.json();
    },
    enabled: !!userAddress,
  });
}

// Usage
function AnalyticsDashboard({ userAddress }: Props) {
  const { data: analytics, isLoading } = useAffiliateAnalytics(userAddress);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="analytics">
      <div className="metric">
        <span>Conversion Rate</span>
        <span>{analytics?.conversionRate}%</span>
      </div>
      <div className="metric">
        <span>Average Payout</span>
        <span>{analytics?.averagePayout} OXC</span>
      </div>
    </div>
  );
}
```

### Automated Reward Claiming

```typescript
// src/utils/autoClaimRewards.ts
import { useReferral } from '@/hooks/useReferral';
import { useEffect } from 'react';

const AUTO_CLAIM_THRESHOLD = 10000000; // 10 OXC
const AUTO_CLAIM_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function useAutoClaimRewards(userAddress: string | null) {
  const { stats, claimRewards } = useReferral(userAddress);

  useEffect(() => {
    if (!userAddress) return;

    const interval = setInterval(() => {
      if (stats && stats.pendingRewards >= AUTO_CLAIM_THRESHOLD) {
        claimRewards()
          .then(() => {
            console.log('Auto-claimed rewards');
          })
          .catch((error) => {
            console.error('Auto-claim failed:', error);
          });
      }
    }, AUTO_CLAIM_INTERVAL);

    return () => clearInterval(interval);
  }, [userAddress, stats, claimRewards]);
}
```

## Testing Examples

```typescript
// src/components/__tests__/ReferralDashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReferralDashboard } from '@/components/ReferralDashboard';

describe('ReferralDashboard', () => {
  it('should generate referral code on button click', async () => {
    render(
      <ReferralDashboard 
        userAddress="ST123..." 
        appUrl="https://test.app"
      />
    );

    const button = screen.getByText('Generate Code');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/[A-Z0-9]{16}/)).toBeInTheDocument();
    });
  });

  it('should copy referral code to clipboard', async () => {
    const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');

    render(
      <ReferralDashboard 
        userAddress="ST123..." 
        appUrl="https://test.app"
      />
    );

    // Generate code first
    const generateBtn = screen.getByText('Generate Code');
    fireEvent.click(generateBtn);

    // Copy code
    const copyBtn = await screen.findByText('Copy Code');
    fireEvent.click(copyBtn);

    expect(clipboardSpy).toHaveBeenCalled();
  });
});
```

## Error Handling Example

```typescript
// src/components/ReferralErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ReferralErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Referral system error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong with the referral system</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

These examples demonstrate how to effectively integrate the referral system throughout your 0xCast application.
