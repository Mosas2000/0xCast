# Reputation System Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: User Reputation Not Updating

**Symptoms**:
- Reputation score remains unchanged after trading
- Level doesn't update despite high transaction volume

**Root Causes**:
- User not created in reputation system
- Invalid metrics passed to update function
- Service not initialized properly

**Solutions**:

```typescript
// Ensure user is created first
if (!manager.getUserReputation(userId)) {
  manager.createUserReputation(userId);
}

// Verify metrics are valid
const metrics = {
  completionRate: 0.95,      // Must be 0-1
  transactionVolume: 50,      // Must be number >= 0
  averageResponseTime: 2,     // Must be number >= 0
  accountAgeDays: 180,        // Must be number >= 0
  verificationLevel: 'level2', // Must be 'level1', 'level2', or 'level3'
};

// Call update with valid data
manager.updateReputationScore(userId, metrics);

// Verify update
const updated = manager.getUserReputation(userId);
console.log('Updated score:', updated?.score.score);
```

### Issue 2: KYC Approval Stuck in Progress

**Symptoms**:
- KYC status shows 'in_progress' indefinitely
- Cannot approve KYC

**Root Causes**:
- Missing required submission steps
- Face verification score too low
- Document validation failed

**Solutions**:

```typescript
// Verify all 3 stages submitted
const status = service.getKYCStatus(userId);
console.log('KYC Status:', status?.status);
console.log('KYC Level:', status?.level);

// Check what's needed
if (status?.level === 'level1') {
  // Need address verification
  manager.submitKYC(userId, {
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
  });
}

if (status?.level === 'level2') {
  // Need face verification with high liveness score (>0.95)
  manager.submitKYC(userId, {
    faceImageHash: 'high_quality_image_hash',
    livenessScore: 0.98, // Must be >= 0.95
  });
}

// Only then approve
manager.approveKYC(userId);
```

### Issue 3: Fraud Alert Never Triggers

**Symptoms**:
- Expected fraud alert not generated
- User not marked as suspicious

**Root Causes**:
- Transaction data incomplete
- Thresholds not met
- Alert already exists for same pattern

**Solutions**:

```typescript
// Verify transaction data is complete
const trades = [
  {
    price: 100,
    amount: 1000,
    timestamp: Date.now(),
    type: 'sell',
  },
  {
    price: 100,
    amount: 950,
    timestamp: Date.now() + 30000,
    type: 'buy',
  },
];

// Check for wash trading (requires same price and 90%+ volume match)
const alert = manager.checkFraudAlert(userId, 'wash_trading', trades);
if (alert) {
  console.log('Alert triggered:', alert.type);
} else {
  console.log('No alert - check thresholds');
  // Volume match: 950/1000 = 95% (meets >90% requirement)
  // Price: 100 (same) ✓
  // Time: 30s (within 60s) ✓
}

// Check user is marked suspicious
const rep = manager.getUserReputation(userId);
console.log('Is suspicious:', rep?.isSuspicious);

// View all alerts for user
const alerts = manager.getFraudAlerts(userId);
console.log('Total alerts:', alerts.length);
```

### Issue 4: Account Linking Code Not Working

**Symptoms**:
- Verification code rejected
- Account linking fails

**Root Causes**:
- Wrong code entered
- Code expired (codes valid for 1 session)
- Requesting verification for wrong account

**Solutions**:

```typescript
// Create link request
const request = manager.linkAccount(userId, 'email', 'user@example.com');
console.log('Verification code:', request.verificationCode);
console.log('Request ID:', request.id);

// Verify immediately (within same session)
const verified = manager.verifyLinkedAccount(
  request.id,
  request.verificationCode // Use exact code
);

if (verified) {
  console.log('Account linked successfully');
} else {
  console.log('Verification failed - check code');
  // Try again - codes don't expire if request still active
  const newRequest = manager.linkAccount(userId, 'email', 'user@example.com');
  manager.verifyLinkedAccount(newRequest.id, newRequest.verificationCode);
}
```

### Issue 5: High Reputation Score Not Achieved

**Symptoms**:
- User score plateaus below expected level
- Cannot reach 'elite' status

**Root Causes**:
- One weak metric pulling down average
- Account age limit reached
- Transaction volume capped

**Solutions**:

```typescript
// Debug current score calculation
const metrics = {
  completionRate: 0.98,        // 40% weight = 39.2
  transactionVolume: 200,      // Capped at 100, 20% weight = 20
  averageResponseTime: 1,      // 15% weight = 15
  accountAgeDays: 400,         // Capped at 365, 15% weight = 15
  verificationLevel: 'level3',  // 10% weight = 10
};

// Total: ~99 (elite)

// If stuck below elite, check:
// 1. Is completionRate really high (>95%)?
completionRate = 0.85; // Only 34 points

// 2. Are most trades completed?
completionRate = 0.95; // Much better

// 3. Is response time low enough?
averageResponseTime = 5; // Reduced to 7.5 points - worse

// 4. Is account old enough?
accountAgeDays = 30; // Only 1.2 points - very low

// Focus on highest-impact improvements:
// - Increase completion rate to 95%+ (+40%)
// - Increase transaction volume (+20%)
// - Reduce response time (+15%)
// - Age account (+15%)
// - Complete KYC verification (+10%)
```

### Issue 6: AML Check Flags User Incorrectly

**Symptoms**:
- User flagged as PEP when not
- False positive on sanctions check

**Root Causes**:
- Name similarity to PEP/sanctioned person
- Incorrect country data
- Legacy data conflicts

**Solutions**:

```typescript
// Review AML check result
const amlResult = manager.performAMLCheck(userId, {
  name: 'John Smith',
  country: 'USA',
  dateOfBirth: '1990-01-01',
});

console.log('Risk score:', amlResult.riskScore);
console.log('PEP:', amlResult.flags.pep);
console.log('Sanctions:', amlResult.flags.sanctions);
console.log('Adverse media:', amlResult.flags.adverseMedia);

// If flagged incorrectly:
// 1. Verify data accuracy
// 2. Check name spelling (AML checks may be case-sensitive)
// 3. Verify correct country
// 4. Submit dispute with documentation
// 5. Request manual review
```

### Issue 7: System Metrics Show Unexpected Values

**Symptoms**:
- Average reputation score too high/low
- KYC completion rate incorrect

**Root Causes**:
- Not all users initialized
- Calculation includes inactive users
- Metrics not refreshed

**Solutions**:

```typescript
// Get system metrics
const metrics = manager.getSystemMetrics();
console.log('Metrics:', metrics);
// {
//   averageScore: 65.5,
//   totalUsers: 1000,
//   verifiedUsers: 450,
//   suspiciousAccountsCount: 12,
//   fraudAlertsCount: 45,
//   kycCompletionRate: 45.0,
// }

// Verify data:
// 1. Check total users count
const allUsers = manager.getUserReputation('any_user_id');
// (System doesn't expose user list, implement separately)

// 2. Manually verify KYC completion
let verifiedCount = 0;
// Loop through all users and count approved KYC

// 3. Check for data consistency
// Expected KYC rate = verifiedUsers / totalUsers
const expectedRate = 450 / 1000 * 100; // 45%
console.log('Expected KYC rate:', expectedRate);
console.log('Reported KYC rate:', metrics.kycCompletionRate);
```

### Issue 8: Fraud Detection Too Sensitive

**Symptoms**:
- Legitimate trades triggering fraud alerts
- False positives for normal activity

**Root Causes**:
- Thresholds too strict
- Normal trading pattern matches heuristic
- Batch trades interpreted as wash trading

**Solutions**:

```typescript
// Review alert thresholds
// Wash trading: 90%+ volume match within 60s
// - If user does legitimate bulk trades, may trigger
// - Solution: Implement order grouping/batching

// Price manipulation: >10% from market price
// - If market is illiquid, normal trades deviate
// - Solution: Add liquidity adjustment

// Volume spoofing: >70% cancellation rate
// - Users may place orders and cancel if no match
// - Solution: Track intent vs accidental cancellations

// Unusual pattern: 100+ transactions in 24 hours
// - Power traders or bots may trigger legitimately
// - Solution: Add reputation whitelist

// To address false positives:
// 1. Investigate each alert thoroughly
// 2. Resolve with "false positive" note
// 3. Build whitelist of legitimate patterns
// 4. Adjust thresholds quarterly based on data
// 5. Implement more sophisticated detection
```

## Debugging Commands

### Check User Reputation Status

```typescript
const userId = 'user123';
const rep = manager.getUserReputation(userId);

if (!rep) {
  console.log('User has no reputation - create it');
  manager.createUserReputation(userId);
} else {
  console.log('User ID:', rep.userId);
  console.log('Score:', rep.score.score);
  console.log('Level:', rep.level);
  console.log('Badges:', rep.badges.length);
  console.log('KYC:', rep.kycStatus.status);
  console.log('Suspicious:', rep.isSuspicious);
  console.log('Linked accounts:', rep.linkedAccounts.length);
}
```

### Check Fraud Alerts

```typescript
const alerts = manager.getFraudAlerts(userId);
console.log('Total alerts:', alerts.length);

alerts.forEach(alert => {
  console.log(`- ${alert.type} (${alert.severity}): ${alert.resolved ? 'resolved' : 'pending'}`);
  console.log(`  Description: ${alert.description}`);
  if (alert.resolved) {
    console.log(`  Resolution: ${alert.resolutionNotes}`);
  }
});
```

### Check System Health

```typescript
const metrics = manager.getSystemMetrics();
const distribution = manager.getReputationDistribution();
const highRiskUsers = manager.getHighRiskUsers();

console.log('=== System Health ===');
console.log('Total users:', metrics.totalUsers);
console.log('Average score:', metrics.averageScore.toFixed(2));
console.log('KYC completion:', metrics.kycCompletionRate.toFixed(1) + '%');
console.log('Suspicious accounts:', metrics.suspiciousAccountsCount);
console.log('Fraud alerts:', metrics.fraudAlertsCount);
console.log('');
console.log('=== Reputation Distribution ===');
console.log('New:', distribution.newUsers);
console.log('Trusted:', distribution.trustedUsers);
console.log('Verified:', distribution.verifiedUsers);
console.log('Elite:', distribution.eliteUsers);
console.log('');
console.log('=== High Risk Users ===');
console.log('Count:', highRiskUsers.length);
highRiskUsers.slice(0, 5).forEach(userId => {
  const rep = manager.getUserReputation(userId);
  console.log(`- ${userId}: score ${rep?.score.score}, alerts ${manager.getFraudAlerts(userId).length}`);
});
```

## Performance Tuning

### Slow Reputation Updates

```typescript
// Profile update speed
const start = performance.now();
manager.updateReputationScore(userId, metrics);
const duration = performance.now() - start;
console.log(`Update took ${duration.toFixed(2)}ms`);

// Should be <10ms. If slower:
// 1. Check metrics calculation
// 2. Verify no blocking operations
// 3. Check for large badge arrays
```

### Memory Usage

```typescript
// Monitor memory (Node.js)
const used = process.memoryUsage();
console.log(`Memory: ${(used.heapUsed / 1024 / 1024).toFixed(2)}MB`);

// If high:
// 1. Check number of users
// 2. Clear old fraud alerts periodically
// 3. Consider database for persistence
```

## Contact and Support

For additional support, check:
- REPUTATION_API_REFERENCE.md - API details
- REPUTATION_INTEGRATION.md - Integration examples
- REPUTATION_IMPLEMENTATION.md - Technical design
