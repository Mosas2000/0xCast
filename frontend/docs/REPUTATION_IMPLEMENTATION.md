# User Reputation and Anti-Fraud System Implementation Guide

## Overview

The reputation and anti-fraud system is a comprehensive module designed to incentivize positive user behavior, prevent fraudulent activities, and ensure platform compliance. The system tracks user reputation through a weighted algorithm, implements KYC/AML verification, detects suspicious patterns, and manages multi-account linking.

## System Architecture

### Core Components

1. **ReputationScoringService**: Calculates reputation scores using weighted metrics
2. **KYCAMLService**: Manages Know Your Customer and Anti-Money Laundering compliance
3. **FraudDetectionService**: Implements 6 fraud detection algorithms
4. **AccountLinkingService**: Manages multi-account verification and linking
5. **ReputationManager**: Orchestrator coordinating all services
6. **React Hooks**: Frontend integration layer
7. **UI Components**: User-facing reputation interfaces

### Data Flow

```
User Activity → FraudDetectionService → FraudAlert
            ↓
        ReputationManager
            ↓
   ReputationScoringService → Score Update
            ↓
        UserReputation
            ↓
         React Hooks
            ↓
       UI Components
```

## Reputation Scoring Algorithm

### Weighted Calculation

Reputation score is calculated using 5 metrics:

```
Score = (CompletionRate × 40%) +
        (TransactionVolume × 20%, capped at 100) +
        (ResponseTime × 15%, inverted) +
        (AccountAge × 15%, capped at 365 days) +
        (VerificationLevel × 10%)

Total Score: 0-100
```

### Reputation Levels

- **new** (0-49): New users with minimal activity
- **trusted** (50-69): Established users with consistent behavior
- **verified** (70-84): Verified users with strong history
- **elite** (85-100): Top performers with excellent track record

### Badges

Users earn badges based on achievements:

- **active_trader**: >80 transactions and >95% completion
- **high_volume**: >100 transactions
- **fast_responder**: Average response time <2 minutes
- **verified_kyc**: Completed full KYC verification
- **long_time_user**: Account age >1 year
- **low_dispute**: Zero disputes or fraud alerts

## KYC/AML Compliance

### KYC Verification Flow

KYC is a 3-stage process:

1. **Personal Information**
   - First name, last name
   - Date of birth
   - Document type (passport, driver's license, ID card)
   - Document ID

2. **Address Verification**
   - Address, city, state
   - Country, postal code
   - Document proof

3. **Face Verification**
   - Face image hash
   - Liveness score (0-1, require ≥0.95)
   - Comparison with document photo

### AML Risk Assessment

AML checks evaluate:

- **PEP Flag** (Politically Exposed Person): +40 risk score
- **Sanctions List**: +50 risk score
- **Adverse Media**: +30 risk score

Risk Score Range: 0-100
- Low (0-25): Normal user
- Medium (26-50): Additional monitoring
- High (51-75): Enhanced due diligence
- Critical (76-100): Immediate escalation

### KYC Lifecycle

- **Submission**: User submits documents
- **In Progress**: System validates each stage
- **Approved**: User passes all checks, KYC valid for 365 days
- **Expired**: KYC expires after 365 days, resubmission required

## Fraud Detection System

### Detection Methods

#### 1. Wash Trading Detection
**Trigger**: Same price, ≥90% volume match, within 60 seconds
**Purpose**: Prevent fake trades to boost volume

Example:
```
User sells 1000 STX @ $100
User buys 950 STX @ $100 within 30 seconds
→ Fraud Alert: wash_trading (high severity)
```

#### 2. Sybil Attack Detection
**Trigger**: Multiple accounts, same IP, created within 24 hours
**Purpose**: Prevent account multiplication for rewards

Example:
```
user1 created from 192.168.1.1
user2 created from 192.168.1.1 within 12 hours
→ Fraud Alert: sybil_attack (critical severity)
```

#### 3. Pump and Dump Detection
**Trigger**: ≥30% price increase with 3x+ volume spike
**Purpose**: Prevent coordinated price manipulation

Example:
```
STX trades: 100 STX/day average
Day 1: Price $100, Volume $1000
Day 2: Price $130 (+30%), Volume $3500 (+3.5x)
→ Fraud Alert: pump_and_dump (high severity)
```

#### 4. Price Manipulation Detection
**Trigger**: Average transaction price >10% from market price
**Purpose**: Detect suspicious pricing on individual trades

Example:
```
Market price: $100
User's trade average: $91 (-10%)
→ Fraud Alert: price_manipulation (medium severity)
```

#### 5. Volume Spoofing Detection
**Trigger**: >70% order cancellation rate
**Purpose**: Prevent fake volume signals

Example:
```
User places 100 orders, cancels 80
Cancellation rate: 80% (>70%)
→ Fraud Alert: volume_spoofing (high severity)
```

#### 6. Unusual Pattern Detection
**Trigger**: New account with 100+ transactions in 24 hours
**Purpose**: Detect suspicious high-frequency activity from new accounts

Example:
```
Account created today
125 transactions in 24 hours
→ Fraud Alert: unusual_pattern (medium severity)
```

### Alert Lifecycle

```
Detection → Recording → Review → Resolution
  ↓           ↓          ↓          ↓
triggered   alert      pending    resolved
           stored
```

## Account Linking System

### Supported Account Types

- **email**: User email addresses (verification code sent via email)
- **phone**: Phone numbers (SMS verification)
- **wallet**: Blockchain wallets (signature verification)
- **social**: Social media accounts (OAuth verification)

### Linking Flow

1. **Initiate**: User requests account link
2. **Generate**: System generates 6-digit verification code
3. **Send**: Code delivered via appropriate channel
4. **Verify**: User submits code for verification
5. **Link**: Account linked to user profile
6. **Protect**: Identify other users linked to same account

### Duplicate Account Detection

If account already linked to another user:
- Mark as suspicious
- Notify both users
- Trigger security review
- Possible account freeze

## Metrics and Analytics

### System Metrics

- **Average Reputation Score**: Weighted average of all users
- **Total Users**: Count of all users with reputation
- **Verified Users**: Users with approved KYC
- **Suspicious Accounts**: Users flagged for fraud
- **Fraud Alerts**: Total outstanding alerts
- **KYC Completion Rate**: Percentage of users with verified KYC

### User Analysis

- **Reputation Distribution**: Users by level
- **KYC Completion**: Users by KYC stage
- **Badge Distribution**: Popular badges earned
- **Fraud Patterns**: Common fraud types
- **High-Risk Users**: Users above risk threshold
- **Verification Timeline**: Average time to KYC approval

## Integration Points

### User Registration

```typescript
// Create reputation on signup
manager.createUserReputation(userId);
```

### Trading Activity

```typescript
// Update reputation after each trade
manager.updateReputationScore(userId, metrics);

// Check for fraud patterns
manager.checkFraudAlert(userId, 'wash_trading', trades);
```

### Market Creation

```typescript
// Require minimum reputation
const requiredScore = getMinimumReputationForAction('create_market');
if (userScore < requiredScore) {
  throw new Error('Insufficient reputation');
}
```

### Compliance

```typescript
// Verify KYC status before payouts
if (!isKYCVerified(userId)) {
  throw new Error('KYC verification required');
}
```

### Account Security

```typescript
// Link accounts to prevent duplicates
manager.linkAccount(userId, 'email', email);

// Find linked users
const linkedUsers = service.findUserByAccount('email', email);
```

## Security Considerations

### Data Protection

- KYC documents encrypted at rest
- Sensitive data never logged
- Access logs maintained for audit
- Regular security reviews

### Fraud Prevention

- Multiple detection algorithms
- Threshold-based alerts
- Manual review process
- Escalation procedures

### Compliance

- KYC/AML integration ready
- Audit trail maintained
- Regulatory-compliant data retention
- Privacy-first design

## Performance Characteristics

### Latency

- Reputation calculation: <10ms
- Fraud detection: <50ms
- KYC submission: <100ms
- Account linking: <30ms

### Scalability

- In-memory storage (ready for DB)
- No blocking operations
- Async-ready architecture
- Can handle 10k+ users

## Configuration

### Reputation Thresholds

```typescript
const thresholds = {
  'create_market': 30,
  'place_large_trade': 50,
  'access_premium_features': 70,
  'participate_liquidity_pool': 40,
  'claim_rewards': 25,
  'create_private_market': 60,
};
```

### Fraud Alert Severity

- **critical**: Immediate action required
- **high**: Priority review needed
- **medium**: Schedule review
- **low**: Log for monitoring

### KYC Expiry

- **Duration**: 365 days from approval
- **Warning**: Notify at 30 days remaining
- **Expired**: Require resubmission

## Monitoring and Maintenance

### Regular Tasks

1. **Daily**: Review new fraud alerts
2. **Weekly**: Analyze reputation trends
3. **Monthly**: KYC compliance review
4. **Quarterly**: System performance audit

### Metrics to Track

- Fraud detection rate
- KYC approval time
- User reputation growth
- Account linking success rate
- High-risk user count

## Future Enhancements

1. **Machine Learning**: ML-based fraud detection
2. **Database**: Replace in-memory with persistent storage
3. **Webhooks**: Real-time alert notifications
4. **API**: Public API for integrations
5. **Advanced Analytics**: Dashboard and reports
6. **Mobile Integration**: Mobile KYC flows
7. **Biometric Authentication**: Enhanced face verification
8. **Blockchain Integration**: On-chain reputation scoring

## Testing

Comprehensive test suite includes:

- Unit tests for each service (150+ test cases)
- Integration tests for system workflows
- Fraud detection validation tests
- KYC flow verification tests
- Account linking tests
- Performance tests
- Security tests

## Support and Troubleshooting

See REPUTATION_TROUBLESHOOTING.md for common issues and solutions.
