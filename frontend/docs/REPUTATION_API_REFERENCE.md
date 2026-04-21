# Reputation System API Reference

Complete API reference for the reputation and anti-fraud system.

## ReputationManager

Central orchestrator for all reputation operations.

### Methods

#### createUserReputation(userId: string): UserReputation

Creates initial reputation for a new user.

```typescript
const rep = manager.createUserReputation('user123');
// Returns: UserReputation object with initial score of 30
```

#### getUserReputation(userId: string): UserReputation | undefined

Retrieves user reputation data.

```typescript
const rep = manager.getUserReputation('user123');
// Returns: { userId, score, level, badges, kycStatus, ... }
```

#### updateReputationScore(userId: string, metrics: ScoreMetrics): void

Updates reputation based on user activity metrics.

```typescript
manager.updateReputationScore('user123', {
  completionRate: 0.95,
  transactionVolume: 50,
  averageResponseTime: 2,
  accountAgeDays: 180,
  verificationLevel: 'level3',
});
```

#### submitKYC(userId: string, data: KYCSubmission): KYCStatus

Submits KYC information. Can be called multiple times for multi-stage verification.

```typescript
manager.submitKYC('user123', {
  firstName: 'John',
  lastName: 'Doe',
  documentType: 'passport',
  documentId: 'ABC123',
  dateOfBirth: '1990-01-01',
});
```

#### approveKYC(userId: string): void

Approves completed KYC application.

```typescript
manager.approveKYC('user123');
```

#### performAMLCheck(userId: string, amlData: AMLCheckData): AMLStatus

Performs AML compliance check.

```typescript
const amlResult = manager.performAMLCheck('user123', {
  name: 'John Doe',
  country: 'USA',
  dateOfBirth: '1990-01-01',
});
```

#### checkFraudAlert(userId: string, type: FraudAlertType, data: any): FraudAlert | null

Checks for specific fraud patterns.

```typescript
const alert = manager.checkFraudAlert('user123', 'wash_trading', transactions);
```

#### linkAccount(userId: string, type: AccountLinkType, value: string): LinkRequest

Initiates account linking request.

```typescript
const request = manager.linkAccount('user123', 'email', 'user@example.com');
// Returns: { id, type, value, verificationCode, ... }
```

#### verifyLinkedAccount(requestId: string, code: string): boolean

Verifies linked account with code.

```typescript
const verified = manager.verifyLinkedAccount('req123', '123456');
```

#### getHighRiskUsers(): string[]

Returns array of high-risk user IDs.

```typescript
const highRiskUsers = manager.getHighRiskUsers();
```

#### getSystemMetrics(): ReputationMetrics

Returns system-wide reputation metrics.

```typescript
const metrics = manager.getSystemMetrics();
// Returns: {
//   averageScore: 65.5,
//   totalUsers: 1000,
//   verifiedUsers: 450,
//   ...
// }
```

#### getReputationDistribution(): ReputationDistribution

Returns distribution of users by reputation level.

```typescript
const dist = manager.getReputationDistribution();
// Returns: { newUsers: 300, trustedUsers: 400, ... }
```

#### getFraudAlerts(userId: string): FraudAlert[]

Returns all fraud alerts for a user.

```typescript
const alerts = manager.getFraudAlerts('user123');
```

#### resolveFraudAlert(alertId: string, notes: string): void

Marks fraud alert as resolved.

```typescript
manager.resolveFraudAlert('alert123', 'False positive');
```

## ReputationScoringService

Handles reputation score calculation and badge awards.

### Methods

#### calculateReputationScore(userId: string, metrics: ScoreMetrics): ReputationScore

Calculates reputation score using weighted algorithm.

```typescript
const score = service.calculateReputationScore('user123', {
  completionRate: 0.95,
  transactionVolume: 50,
  averageResponseTime: 2,
  accountAgeDays: 180,
  verificationLevel: 'level3',
});
// Returns: { score: 78, level: 'verified', timestamp: ... }
```

#### determineLevel(score: number): ReputationLevel

Determines reputation level from score.

```typescript
const level = service.determineLevel(75);
// Returns: 'verified'
```

Levels:
- 'new': 0-49
- 'trusted': 50-69
- 'verified': 70-84
- 'elite': 85-100

#### determineBadges(metrics: ScoreMetrics): Badge[]

Awards badges based on metrics.

```typescript
const badges = service.determineBadges(metrics);
// Returns array of earned badges
```

## KYCAMLService

Manages KYC verification and AML compliance.

### Methods

#### submitKYC(userId: string, data: KYCSubmission): KYCStatus

Submits KYC data. Call multiple times for multi-step process.

Stages:
1. Personal information (firstName, lastName, dateOfBirth, documentType, documentId)
2. Address (address, city, state, country, postalCode)
3. Face verification (faceImageHash, livenessScore)

```typescript
manager.submitKYC('user123', { firstName: 'John', ... });
```

#### approveKYC(userId: string): void

Approves KYC after all stages complete.

```typescript
manager.approveKYC('user123');
```

#### getKYCStatus(userId: string): KYCStatus | undefined

Retrieves current KYC status.

```typescript
const status = service.getKYCStatus('user123');
// Returns: { status: 'in_progress', level: 'level2', ... }
```

#### performAMLCheck(userId: string, amlData: AMLCheckData): AMLStatus

Performs AML risk assessment.

```typescript
const result = service.performAMLCheck('user123', {
  name: 'John Doe',
  country: 'USA',
  dateOfBirth: '1990-01-01',
});
// Returns: { riskScore: 20, flags: { pep: false, ... } }
```

## FraudDetectionService

Detects suspicious trading patterns and account activities.

### Methods

#### detectWashTrading(userId: string, symbol: string, trades: Trade[]): FraudAlert | null

Detects wash trading pattern.

Triggers when: Same price, 90%+ volume match, within 60 seconds

```typescript
const alert = service.detectWashTrading('user123', 'STX', trades);
```

#### detectSybilAttack(userId: string, linkedUserId: string, ipAddress: string, timestamp: number): FraudAlert | null

Detects linked account attacks.

Triggers when: Same IP, accounts created within 24 hours

```typescript
const alert = service.detectSybilAttack('user1', 'user2', '192.168.1.1', now);
```

#### detectPumpDump(userId: string, symbol: string, priceHistory: PriceData[]): FraudAlert | null

Detects pump and dump pattern.

Triggers when: 30%+ price increase, 3x+ volume spike

```typescript
const alert = service.detectPumpDump('user123', 'STX', priceData);
```

#### detectPriceManipulation(userId: string, trades: Trade[], marketPrice: number): FraudAlert | null

Detects price manipulation.

Triggers when: Average price >10% from market price

```typescript
const alert = service.detectPriceManipulation('user123', trades, 100);
```

#### detectVolumeSpoofing(userId: string, symbol: string, orders: number, cancelled: number): FraudAlert | null

Detects volume spoofing.

Triggers when: >70% cancellation rate

```typescript
const alert = service.detectVolumeSpoofing('user123', 'STX', 100, 80);
```

#### detectUnusualPattern(userId: string, transactionCount: number): FraudAlert | null

Detects unusual account activity.

Triggers when: New account with 100+ transactions in 24 hours

```typescript
const alert = service.detectUnusualPattern('user123', 150);
```

#### getAlertsByUser(userId: string): FraudAlert[]

Retrieves all alerts for a user.

```typescript
const alerts = service.getAlertsByUser('user123');
```

#### recordAlert(userId: string, alert: FraudAlert): void

Records a fraud alert.

```typescript
service.recordAlert('user123', alertData);
```

#### resolveAlert(alertId: string, notes: string): void

Marks alert as resolved.

```typescript
service.resolveAlert('alert123', 'Investigation complete');
```

## AccountLinkingService

Manages multi-account verification and linking.

### Methods

#### linkAccount(userId: string, type: AccountLinkType, value: string): LinkRequest

Creates account linking request.

Supported types: 'email', 'phone', 'wallet', 'social'

```typescript
const request = service.linkAccount('user123', 'email', 'user@example.com');
// Returns: { id, type, value, verificationCode, ... }
```

#### verifyLink(requestId: string, code: string): boolean

Verifies linking code.

```typescript
const verified = service.verifyLink('req123', userProvidedCode);
```

#### findUserByAccount(type: AccountLinkType, value: string): string[]

Finds users linked to account.

```typescript
const users = service.findUserByAccount('email', 'user@example.com');
```

#### markAccountSuspicious(type: AccountLinkType, value: string, reason: string): void

Marks account as suspicious.

```typescript
service.markAccountSuspicious('email', 'user@example.com', 'Fraud report');
```

#### isAccountSuspicious(type: AccountLinkType, value: string): boolean

Checks if account is marked suspicious.

```typescript
const suspicious = service.isAccountSuspicious('email', 'user@example.com');
```

## Type Definitions

### ReputationLevel
```typescript
type ReputationLevel = 'new' | 'trusted' | 'verified' | 'elite';
```

### AccountLinkType
```typescript
type AccountLinkType = 'email' | 'phone' | 'wallet' | 'social';
```

### FraudAlertType
```typescript
type FraudAlertType =
  | 'wash_trading'
  | 'sybil_attack'
  | 'pump_and_dump'
  | 'price_manipulation'
  | 'volume_spoofing'
  | 'unusual_pattern';
```

### KYCStatus
```typescript
interface KYCStatus {
  status: 'none' | 'in_progress' | 'approved' | 'rejected';
  level: 'level1' | 'level2' | 'level3';
  submittedAt?: number;
  approvedAt?: number;
}
```

### UserReputation
```typescript
interface UserReputation {
  userId: string;
  score: ReputationScore;
  level: ReputationLevel;
  badges: Badge[];
  kycStatus: KYCStatus;
  amlStatus?: AMLStatus;
  isSuspicious: boolean;
  linkedAccounts: LinkedAccount[];
}
```
