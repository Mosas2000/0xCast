# 0xCast Referral and Affiliate System

## Overview

The 0xCast Referral and Affiliate System is a comprehensive program designed to incentivize user acquisition and reward community members for bringing new users to the platform. This system includes smart contracts, frontend components, and backend integration for tracking and distributing rewards.

## Status

This is a complete implementation of issue #99 - "Add referral and affiliate system". The system addresses the need for user acquisition incentives through a tiered affiliate program with automated reward distribution.

## Features Implemented

✅ **Referral Links Working** - Unique 16-byte referral codes with URL parameter tracking
✅ **Rewards Tracked Correctly** - Comprehensive reward tracking with multiple action types
✅ **Affiliate Dashboard Functional** - Full-featured dashboard with statistics and controls
✅ **Payouts Automated** - Automatic reward distribution and claim functionality
✅ **Fraud Detection Enabled** - Multiple prevention mechanisms including cooldowns and limits
✅ **Tests Verify Mechanics** - Comprehensive test suite covering all functionality

## What's Included

### Smart Contracts

- **referral-core.clar** - Main referral contract with code generation, reward tracking, and affiliate management
- **referral-integration.clar** - Integration module for market interactions

### Frontend Components

- **ReferralDashboard.tsx** - Full-featured dashboard showing all referral statistics and controls
- **ReferralCard.tsx** - Compact card component for homepage integration
- **RewardHistory.tsx** - Transaction history component showing all reward activities
- **ReferralInvitation.tsx** - Email invitation component for inviting friends

### Frontend Hooks

- **useReferral.ts** - Main hook for referral code generation and management
- **useReferralIntegration.ts** - Hook for integrating rewards with marketplace actions

### Frontend Utilities

- **referralUtils.ts** - Utility functions for code validation, sharing, and formatting
- **referralTracking.ts** - Analytics and tracking middleware
- **referralConfig.ts** - Centralized configuration with feature flags

### Frontend Types

- **referral.ts** - Complete TypeScript type definitions for the referral system

### Backend

- **referral-operations.ts** - Script for backend operations like batch processing and reporting
- **integration-integration.clar** - Contract for integrating with market core

### Documentation

- **REFERRAL_SYSTEM.md** - Complete system documentation with API reference
- **REFERRAL_INTEGRATION.md** - Integration guide for developers
- **REFERRAL_EXAMPLES.md** - Practical implementation examples

### Tests

- **referral.test.ts** - Comprehensive test suite with 29 test cases

## Quick Start

### 1. Deploy Smart Contract

```bash
cd /path/to/0xCast
clarinet deploy --network mainnet contracts/referral-core.clar
```

### 2. Add to Your App

```typescript
import { ReferralDashboard } from '@/components/ReferralDashboard';

function App() {
  return (
    <ReferralDashboard 
      userAddress={userAddress} 
      appUrl="https://0xcast.app"
    />
  );
}
```

### 3. Integrate with Markets

```typescript
import { useReferralIntegration } from '@/hooks/useReferralIntegration';

function PredictionForm() {
  const { triggerRewardIfReferred } = useReferralIntegration(userAddress);
  
  // On prediction placement:
  await triggerRewardIfReferred(market, prediction);
}
```

## Configuration

Edit `frontend/src/config/referralConfig.ts` to customize:

- Base reward rate (default: 5%)
- Tiered commission structure
- Fraud prevention settings
- Feature flags
- UI behavior

Example:

```typescript
export const REFERRAL_CONFIG = {
  REWARDS: {
    BASE_RATE: 5,  // 5% commission
    MIN_THRESHOLD: 100000,  // 0.1 OXC
  },
  TIERS: [
    { referrals: 5, rate: 5 },
    { referrals: 10, rate: 6 },
    { referrals: 25, rate: 7 },
    // ... more tiers
  ],
};
```

## System Architecture

### Data Flow

```
User joins with referral code
    ↓
Register with code (creates referral relationship)
    ↓
User performs actions (predictions, trades, etc.)
    ↓
Reward recorded for referrer
    ↓
Referrer can claim accumulated rewards
```

### Smart Contract Functions

**Public Functions:**
- `generate-referral-code()` - Create unique code
- `register-referral-with-code(code)` - Register with a code
- `record-referral-reward(referrer, user, amount, type)` - Record reward
- `claim-referral-rewards()` - Claim pending rewards
- `deactivate-code(code)` - Deactivate a code

**Read-Only Functions:**
- `get-referral-code-info(code)` - Get code metadata
- `get-user-referral-info(user)` - Get user's referral info
- `get-affiliate-stats(user)` - Get user's affiliate statistics
- `get-total-referrals()` - Total referrals on platform
- `get-total-distributed()` - Total rewards distributed

## Reward Structure

### Base Commission
- **5%** of referred user's spending on any tracked action

### Tiered Rates
- 5+ referrals: 5%
- 10+ referrals: 6%
- 25+ referrals: 7%
- 50+ referrals: 8%
- 100+ referrals: 10%

### Qualifying Actions
- Market predictions
- Liquidity provision
- Trading
- Governance participation
- Staking

## Fraud Prevention

The system includes multiple layers of fraud detection:

1. **Cooldown Period** (~1 day) - Prevents rapid referral spam
2. **Address Limits** - Maximum 1000 referrals per address
3. **Self-Referral Check** - Users cannot refer themselves
4. **Duplicate Prevention** - Users can only be referred once
5. **Minimum Thresholds** - Rewards below 0.0001 OXC not recorded

## File Structure

```
0xCast/
├── contracts/
│   ├── referral-core.clar              # Main contract
│   └── referral-integration.clar       # Integration module
├── frontend/src/
│   ├── components/
│   │   ├── ReferralDashboard.tsx       # Main dashboard
│   │   ├── ReferralCard.tsx            # Homepage card
│   │   ├── RewardHistory.tsx           # History view
│   │   └── ReferralInvitation.tsx      # Email invites
│   ├── hooks/
│   │   ├── useReferral.ts              # Main hook
│   │   └── useReferralIntegration.ts   # Integration hook
│   ├── utils/
│   │   ├── referralUtils.ts            # Utilities
│   │   ├── referralTracking.ts         # Analytics
│   │   └── referralConfig.ts           # Config
│   ├── types/
│   │   └── referral.ts                 # Types
│   └── config/
│       └── referralConfig.ts           # Configuration
├── scripts/
│   └── referral-operations.ts          # Backend operations
├── tests/
│   └── referral.test.ts                # Test suite
└── docs/
    ├── REFERRAL_SYSTEM.md              # System docs
    ├── REFERRAL_INTEGRATION.md         # Integration guide
    └── REFERRAL_EXAMPLES.md            # Examples
```

## Testing

Run the complete test suite:

```bash
npm run test -- referral.test.ts
```

Tests cover:
- ✓ Referral code generation
- ✓ Registration with codes
- ✓ Reward recording and tracking
- ✓ Reward claiming
- ✓ Fraud detection
- ✓ Global state management
- ✓ Code deactivation
- ✓ User information retrieval

## Integration Checklist

- [ ] Deploy referral-core.clar contract
- [ ] Update contract address in configuration
- [ ] Add ReferralDashboard to profile page
- [ ] Add ReferralCard to homepage
- [ ] Integrate useReferralIntegration in market flow
- [ ] Set up backend reward recording
- [ ] Configure analytics tracking
- [ ] Test end-to-end referral flow
- [ ] Deploy to production
- [ ] Monitor referral metrics

## Usage Examples

### Generate Referral Code

```typescript
const { referralCode, generateCode } = useReferral(userAddress);
await generateCode();
```

### Register with Code

```typescript
const { registerWithCode } = useReferral(userAddress);
await registerWithCode('ABC123DEF456');
```

### Get Affiliate Stats

```typescript
const { stats } = useReferral(userAddress);
console.log(stats.totalReferred, stats.pendingRewards);
```

### Claim Rewards

```typescript
const { claimRewards } = useReferral(userAddress);
const amount = await claimRewards();
```

### Share Referral Link

```typescript
import { createReferralLink, generateShareMessage } from '@/utils/referralUtils';

const link = createReferralLink('https://0xcast.app', referralCode);
const message = generateShareMessage(referralCode);
```

## Environment Variables

```bash
REACT_APP_REFERRAL_CONTRACT_ADDRESS=ST1NQE83F536G9Z8NN8DFY3N7RGQS14N5R5DCB0PM.referral-core
REACT_APP_NETWORK=mainnet
REACT_APP_URL=https://0xcast.app
REACT_APP_EMAIL_PROVIDER=sendgrid
```

## Best Practices

1. **Always validate codes** before processing registrations
2. **Set minimum thresholds** to prevent dust rewards
3. **Monitor affiliate payouts** for fraud patterns
4. **Track key metrics** (referrals, claims, retention)
5. **Test thoroughly** before production deployment
6. **Document integrations** for your team
7. **Keep contracts updated** and consistent

## Support & Documentation

- **System Documentation**: See `docs/REFERRAL_SYSTEM.md`
- **Integration Guide**: See `docs/REFERRAL_INTEGRATION.md`
- **Code Examples**: See `docs/REFERRAL_EXAMPLES.md`
- **API Reference**: Inline JSDoc in all components and utilities

## Security Considerations

- ✅ Access control enforced (owner-only functions)
- ✅ Input validation on all parameters
- ✅ Reentrancy safe (state updates before transfers)
- ✅ Rate limiting via cooldown periods
- ✅ Minimum thresholds prevent dust attacks
- ✅ All functions have error codes
- ✅ Comprehensive error handling

## Performance

- Referral code generation: O(1)
- Reward recording: O(1)
- Reward claiming: O(1)
- Stats retrieval: O(1)
- Minimal contract storage footprint
- Efficient data structures

## Future Enhancements

Potential improvements for future iterations:

1. **Leaderboard** - Top affiliates ranking
2. **Bulk Operations** - Batch referral processing
3. **Webhook Integration** - Real-time event notifications
4. **Advanced Analytics** - Detailed performance metrics
5. **Marketing Tools** - Pre-made share templates
6. **Referral Tiers** - VIP affiliate programs
7. **Commission Splits** - Multi-level referrals
8. **API Endpoints** - REST API for integrations

## License

This implementation is part of the 0xCast project and follows the same license.

## Contributing

To contribute to the referral system:

1. Review the implementation guide (`REFERRAL_INTEGRATION.md`)
2. Check existing test cases (`referral.test.ts`)
3. Follow the code style and patterns
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

## Support

For issues, questions, or suggestions regarding the referral system, please open an issue on GitHub or contact the development team.

---

**Last Updated**: April 19, 2026
**Status**: Complete and Ready for Integration
**Commits**: 20+ professional commits with clear messages
