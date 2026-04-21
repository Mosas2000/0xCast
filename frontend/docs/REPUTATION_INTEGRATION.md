# Reputation System Integration Guide

This guide provides step-by-step instructions for integrating the reputation and anti-fraud system into your application.

## Quick Start

### 1. Initialize Reputation Manager

```typescript
import { ReputationManager } from '@/services/ReputationManager';

const manager = ReputationManager.getInstance();
```

### 2. Create User Reputation

```typescript
// When user joins or completes first action
manager.createUserReputation(userId);
```

### 3. Update Reputation Score

```typescript
manager.updateReputationScore(userId, {
  completionRate: 0.95,      // 95% of trades completed
  transactionVolume: 50,      // 50 transactions
  averageResponseTime: 2,     // 2 minute average response
  accountAgeDays: 180,        // Account 6 months old
  verificationLevel: 'level2', // KYC level 2
});
```

## Integration Points

### User Profile Page

```typescript
import { useReputation } from '@/hooks/useReputationHooks';

function UserProfilePage({ userId }) {
  const { reputation, level, badges } = useReputation(userId);

  return (
    <div>
      <ReputationCard reputation={reputation} level={level} />
      <BadgesDisplay badges={badges} />
    </div>
  );
}
```

### Market Creation

Before allowing market creation, check minimum reputation:

```typescript
import { getMinimumReputationForAction } from '@/utils/reputationUtils';

function CreateMarketButton({ userId }) {
  const rep = manager.getUserReputation(userId);
  const requiredScore = getMinimumReputationForAction('create_market');

  if (!rep || rep.score.score < requiredScore) {
    return <div>Build reputation to create markets</div>;
  }

  return <button>Create Market</button>;
}
```

### Trading Activity

Track trades and update reputation:

```typescript
async function executeTrade(userId, trade) {
  // Execute trade
  const result = await broker.executeTrade(trade);

  // Update reputation
  manager.updateReputationScore(userId, {
    completionRate: calculateCompletionRate(userId),
    transactionVolume: getTransactionCount(userId),
    averageResponseTime: calculateAvgResponseTime(userId),
    accountAgeDays: getDaysAccountActive(userId),
    verificationLevel: getKYCLevel(userId),
  });

  return result;
}
```

### Fraud Monitoring

Monitor trades for suspicious patterns:

```typescript
function monitorTrade(userId, trade) {
  // Check for fraud patterns
  const alert = manager.checkFraudAlert(
    userId,
    'wash_trading',
    getRecentTransactions(userId)
  );

  if (alert) {
    // Take action
    logSecurityEvent(userId, alert);
    notifySecurityTeam(alert);
  }
}
```

### KYC Verification Flow

```typescript
// Step 1: Submit documents
manager.submitKYC(userId, {
  firstName: 'John',
  lastName: 'Doe',
  documentType: 'passport',
  documentId: 'ABC123',
  dateOfBirth: '1990-01-01',
});

// Step 2: Address verification
manager.submitKYC(userId, {
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  postalCode: '10001',
});

// Step 3: Face verification
manager.submitKYC(userId, {
  faceImageHash: imageHash,
  livenessScore: 0.98,
});

// Step 4: Approve
manager.approveKYC(userId);
```

### Account Linking

```typescript
// Request link
const linkRequest = manager.linkAccount(
  userId,
  'email',
  'user@example.com'
);

// Send verification code via email
await sendEmail(linkRequest.value, {
  subject: 'Verify your email',
  code: linkRequest.verificationCode,
});

// User submits code
const verified = manager.verifyLinkedAccount(
  linkRequest.id,
  userProvidedCode
);
```

## Using React Hooks

### useReputation Hook

```typescript
function UserDashboard({ userId }) {
  const { reputation, level, loading, error } = useReputation(userId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h2>Your Reputation: {reputation?.score}</h2>
      <p>Level: {level}</p>
    </div>
  );
}
```

### useKYC Hook

```typescript
function KYCVerification({ userId }) {
  const { kycStatus, submitKYC, approveKYC, isVerified } = useKYC(userId);

  return (
    <div>
      {!isVerified && (
        <button onClick={() => submitKYC(formData)}>
          Submit KYC
        </button>
      )}
      {isVerified && <VerifiedBadge />}
    </div>
  );
}
```

### useFraudDetection Hook

```typescript
function PortfolioMonitor({ userId }) {
  const { suspiciousActivity, highRiskUsers } = useFraudDetection();

  return (
    <div>
      {suspiciousActivity.map(alert => (
        <FraudAlert key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
```

## Admin Dashboard Integration

```typescript
function AdminDashboard() {
  const manager = ReputationManager.getInstance();

  const metrics = manager.getSystemMetrics();
  const distribution = manager.getReputationDistribution();
  const highRiskUsers = manager.getHighRiskUsers();

  return (
    <div className="space-y-6">
      <SystemMetricsCard metrics={metrics} />
      <ReputationDistributionChart distribution={distribution} />
      <HighRiskUsersList users={highRiskUsers} />
    </div>
  );
}
```

## Error Handling

```typescript
try {
  manager.createUserReputation(userId);
  manager.updateReputationScore(userId, scoreData);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    // Handle user not found
  } else if (error instanceof ValidationError) {
    // Handle validation error
  } else {
    // Handle generic error
  }
}
```

## Performance Considerations

1. **Batch Updates**: Update multiple users in batches
2. **Caching**: Cache reputation scores with 1-5 minute TTL
3. **Async Operations**: Load reputation data asynchronously
4. **Indexing**: Index users by reputation level for fast queries

## Security Best Practices

1. **Validate Input**: Always validate KYC data
2. **Protect KYC Data**: Encrypt sensitive documents
3. **Rate Limiting**: Limit reputation update frequency
4. **Audit Logging**: Log all fraud alerts and KYC approvals
5. **Alert Review**: Review all fraud alerts before taking action

## Testing the Integration

```typescript
// Create test user
const testUser = 'test_user_' + Date.now();
manager.createUserReputation(testUser);

// Update score
manager.updateReputationScore(testUser, {
  completionRate: 0.9,
  transactionVolume: 50,
  averageResponseTime: 3,
  accountAgeDays: 100,
  verificationLevel: 'level2',
});

// Verify result
const rep = manager.getUserReputation(testUser);
console.assert(rep?.score.score > 50, 'Score should be > 50');
console.assert(rep?.level === 'trusted', 'Level should be trusted');
```

## Troubleshooting

### User Reputation Not Updating
- Verify user exists: `manager.getUserReputation(userId)`
- Check data passed to update function
- Verify no validation errors

### KYC Not Progressing
- Ensure all 3 steps completed before approval
- Check face verification liveness score >= 0.95
- Verify document ID format is correct

### Fraud Alert Not Triggered
- Verify transaction data is complete
- Check thresholds match detection algorithm
- Review alert history for duplicates

## Next Steps

1. Integrate into user creation flow
2. Add to market creation requirements
3. Implement KYC verification UI
4. Set up admin monitoring dashboard
5. Configure fraud alert notifications
