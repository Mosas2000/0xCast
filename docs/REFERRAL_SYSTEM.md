# Referral and Affiliate System Documentation

## Overview

The 0xCast Referral and Affiliate System is a comprehensive program designed to incentivize user growth through referrals and reward affiliates for bringing new users to the platform.

## Features

- **Unique Referral Codes**: Generate personalized referral codes for sharing
- **Reward Tracking**: Automatic tracking of all referral rewards
- **Affiliate Dashboard**: Monitor referrals, earnings, and statistics
- **Automated Payouts**: Direct rewards distribution to user wallets
- **Fraud Detection**: Prevention mechanisms to ensure system integrity
- **Tiered Commissions**: Higher commission rates for top affiliates

## Smart Contracts

### referral-core.clar

The main referral contract handling all referral logic.

#### Key Functions

##### generate-referral-code()
Generates a unique 16-character referral code for the caller.

```clarinet
(generate-referral-code)
```

Returns: `(response (string-ascii 16) error)`

##### register-referral-with-code(code)
Registers a user with a referral code.

```clarinet
(register-referral-with-code referral-code)
```

Parameters:
- `referral-code`: 16-character referral code

Returns: `(response bool error)`

Error Codes:
- `u501`: Invalid code
- `u502`: Already referred
- `u503`: Self-referral attempted
- `u509`: Fraud detected

##### record-referral-reward(referrer, user, amount, action-type)
Records a reward for a referral (called by owner).

```clarinet
(record-referral-reward referrer referral-user action-amount action-type)
```

Parameters:
- `referrer`: Principal address of the referrer
- `referral-user`: Principal address of the referred user
- `action-amount`: Amount in microunits
- `action-type`: Type of action (e.g., "market-prediction")

Returns: `(response bool error)`

##### claim-referral-rewards()
Claims accumulated pending rewards.

```clarinet
(claim-referral-rewards)
```

Returns: `(response uint error)`

#### Read-Only Functions

##### get-affiliate-stats(user)
Returns affiliate statistics for a user.

```clarinet
(get-affiliate-stats user)
```

Returns:
```
{
  total-referred: uint,
  total-earned: uint,
  total-claimed: uint,
  pending-rewards: uint,
  active-referrals: uint,
  last-referral-block: uint
}
```

##### get-user-referral-info(user)
Returns referral information for a user.

```clarinet
(get-user-referral-info user)
```

Returns:
```
{
  referrer: (optional principal),
  referral-code: (string-ascii 16),
  referred-at: uint
}
```

## Frontend Integration

### Hooks

#### useReferral(userAddress)
Main hook for referral management.

```typescript
const { 
  referralCode, 
  stats, 
  isLoading, 
  error,
  generateCode,
  registerWithCode,
  claimRewards,
  getReferrer
} = useReferral(userAddress);
```

#### useReferralIntegration(userAddress)
Hook for integrating referral rewards with actions.

```typescript
const {
  recordRewardOnAction,
  triggerRewardIfReferred,
  isPending,
  lastError,
  rewards
} = useReferralIntegration(userAddress);
```

### Components

#### ReferralDashboard
Full-featured dashboard for managing referrals.

```typescript
<ReferralDashboard userAddress={userAddress} appUrl="https://0xcast.app" />
```

Props:
- `userAddress`: User's wallet address
- `appUrl`: Base URL for referral links

#### ReferralCard
Compact card for displaying referral information.

```typescript
<ReferralCard 
  userAddress={userAddress} 
  appUrl="https://0xcast.app" 
  compact={true}
/>
```

Props:
- `userAddress`: User's wallet address
- `appUrl`: Base URL for referral links
- `compact`: Show compact version (default: false)

#### RewardHistory
Component for viewing reward transaction history.

```typescript
<RewardHistory userAddress={userAddress} maxItems={10} />
```

Props:
- `userAddress`: User's wallet address
- `maxItems`: Maximum transactions to display (default: 10)

#### ReferralInvitation
Component for inviting friends via email.

```typescript
<ReferralInvitation 
  referralCode={code} 
  onInvitationSent={(method) => console.log(method)}
/>
```

Props:
- `referralCode`: User's referral code
- `onInvitationSent`: Callback when invitation is sent

### Utilities

#### Referral Code Management

```typescript
import { 
  generateReferralCode,
  validateReferralCode,
  createReferralLink,
  getReferralCodeFromUrl
} from '@/utils/referralUtils';

// Generate a code
const code = generateReferralCode();

// Validate a code
const isValid = validateReferralCode(code);

// Create shareable link
const link = createReferralLink('https://0xcast.app', code);

// Get code from URL parameters
const urlCode = getReferralCodeFromUrl();
```

#### Referral Tracking

```typescript
import { ReferralTracker, ReferralMiddleware } from '@/utils/referralTracking';

// Initialize tracking
ReferralTracker.initializeTracking();

// Track actions
ReferralTracker.trackReferralAction('registration', { 
  referralCode: 'ABC123' 
});

// Setup middleware
ReferralMiddleware.setupReferralTracking();
```

## Reward Structure

### Commission Rates

Default base commission: **5%** of referred user's spending

Tiered commission rates:
- 5+ referrals: 5%
- 10+ referrals: 6%
- 25+ referrals: 7%
- 50+ referrals: 8%
- 100+ referrals: 10%

### Rewarded Actions

- **Market Predictions**: User places a prediction on any market
- **Liquidity Provision**: User adds liquidity to pools
- **Trading**: User executes trades
- **Governance**: User participates in governance votes

## Fraud Prevention

The system includes multiple fraud detection mechanisms:

1. **Cooldown Period**: ~1 day between referrals from same address
2. **Referral Limit**: Maximum 1000 active referrals per address
3. **Self-Referral Check**: Prevents users from referring themselves
4. **Duplicate Check**: Users can only be referred once
5. **Minimum Threshold**: Rewards below 0.0001 OXC are not recorded

## Backend Integration

### Referral Operations Script

The `scripts/referral-operations.ts` file provides utilities for:

- Generating referral codes
- Processing batch referrals
- Recording rewards
- Claiming rewards
- Generating affiliate reports

Example:

```typescript
import { ReferralOperations } from '@/scripts/referral-operations';

const config = {
  contractAddress: 'ST1NQE83F536G9Z8NN8DFY3N7RGQS14N5R5DCB0PM.referral-core',
  network: 'mainnet'
};

const referralOps = new ReferralOperations(config);

// Get stats
const stats = await referralOps.getAffiliateStats(userAddress);

// Record batch rewards
await referralOps.processBatchRewards([
  { 
    referrer: 'ST1...', 
    referredUser: 'ST2...', 
    amount: 1000000, 
    actionType: 'market-prediction' 
  }
], ownerAddress);
```

## Testing

Comprehensive test suite in `tests/referral.test.ts`:

```bash
npm run test -- referral.test.ts
```

Tests cover:
- Code generation
- Referral registration
- Reward tracking
- Fraud detection
- Admin functions
- Global state management

## Security Considerations

1. **Access Control**: Only contract owner can record rewards
2. **Input Validation**: All inputs are validated before processing
3. **Reentrancy Protection**: State updates happen before external calls
4. **Rate Limiting**: Cooldown prevents rapid referral spam
5. **Amount Validation**: Minimum thresholds prevent dust rewards

## Configuration

### Reward Parameters

Edit contract constants in `referral-core.clar`:

```clarinet
(define-constant REFERRAL-REWARD-RATE u500) ;; 5% (500 basis points)
(define-constant MIN-REWARD-THRESHOLD u100000) ;; 0.1 OXC
(define-constant REFERRAL-COOLDOWN u144) ;; ~1 day
(define-constant MAX-REFERRALS-PER-ADDRESS u1000)
```

### Integration Points

1. **Market Creation**: Emit referral event when market is created
2. **Predictions**: Trigger reward recording on prediction placement
3. **Liquidity**: Record rewards for liquidity provision
4. **Trading**: Calculate rewards on trade completion

## Analytics

The system tracks:

- Total referrals count
- Total rewards distributed
- Active affiliates
- Commission tier distribution
- Referral source attribution
- User retention metrics

## FAQ

**Q: How long are referral codes valid?**
A: Indefinitely, until deactivated by the owner.

**Q: Can I refer multiple people?**
A: Yes, unlimited referrals per account.

**Q: How often can I claim rewards?**
A: Anytime when pending rewards are available.

**Q: Is there a minimum to claim?**
A: Yes, rewards below 0.0001 OXC cannot be claimed.

**Q: Can I change my referrer?**
A: No, the referral relationship is permanent once set.

**Q: What happens if the referred user leaves?**
A: You retain the referral relationship and continue earning on their activities.

## Support

For issues or questions, contact support@0xcast.app
