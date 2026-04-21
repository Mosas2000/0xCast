export interface ReputationScore {
  userId: string;
  score: number;
  level: ReputationLevel;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageResponseTime: number;
  completionRate: number;
  lastUpdated: number;
  badges: string[];
}

export type ReputationLevel = 'new' | 'trusted' | 'verified' | 'elite';

export interface UserReputation {
  userId: string;
  reputationScore: ReputationScore;
  verificationStatus: VerificationStatus;
  accountLinks: LinkedAccount[];
  suspiciousActivities: SuspiciousActivity[];
  kycStatus: KYCStatus;
  createdAt: number;
  updatedAt: number;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface LinkedAccount {
  accountId: string;
  linkedUserId: string;
  linkType: 'wallet' | 'email' | 'phone' | 'social';
  linkedAt: number;
  status: 'active' | 'inactive' | 'suspicious';
}

export interface SuspiciousActivity {
  activityId: string;
  userId: string;
  type: SuspiciousActivityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  status: ActivityStatus;
  evidence?: string[];
}

export type SuspiciousActivityType = 'wash_trading' | 'sybil_attack' | 'price_manipulation' | 'volume_spoofing' | 'pump_dump' | 'unusual_pattern';

export type ActivityStatus = 'pending' | 'investigating' | 'confirmed' | 'resolved' | 'dismissed';

export interface KYCStatus {
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
  submittedAt?: number;
  verifiedAt?: number;
  documentType: 'passport' | 'license' | 'national_id';
  documentVerified: boolean;
  addressVerified: boolean;
  faceVerified: boolean;
  expiresAt?: number;
}

export interface TradingPattern {
  userId: string;
  patternId: string;
  type: 'wash_trading' | 'pump_dump' | 'price_manipulation' | 'volume_spoofing';
  confidence: number;
  detectedAt: number;
  transactions: string[];
  riskScore: number;
}

export interface FraudAlert {
  alertId: string;
  userId: string;
  type: 'high_risk_transaction' | 'suspicious_pattern' | 'account_compromise' | 'multiple_accounts';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: number;
  status: 'active' | 'acknowledged' | 'resolved';
  actionRequired: boolean;
}

export interface AMLCheck {
  checkId: string;
  userId: string;
  timestamp: number;
  pep: boolean;
  sanctions: boolean;
  adverseMedia: boolean;
  riskScore: number;
  status: 'clear' | 'under_review' | 'flagged';
}

export interface ReputationAdjustment {
  adjustmentId: string;
  userId: string;
  amount: number;
  reason: string;
  timestamp: number;
  appliedBy: string;
}

export interface WashTradingDetection {
  detectionId: string;
  userId: string;
  buyerId: string;
  sellerId: string;
  marketId: string;
  transactions: TransactionPair[];
  confidence: number;
  detectedAt: number;
  status: 'potential' | 'confirmed' | 'dismissed';
}

export interface TransactionPair {
  buyTransaction: string;
  sellTransaction: string;
  timeDelta: number;
  priceDelta: number;
  volumeMatching: number;
}

export interface SybilDetection {
  detectionId: string;
  accounts: string[];
  similarity: number;
  detectedAt: number;
  status: 'potential' | 'confirmed' | 'dismissed';
  evidence: SybilEvidence;
}

export interface SybilEvidence {
  ipAddressMatches: number;
  timingPatterns: number;
  tradingBehavior: number;
  fundingPatterns: number;
  deviceFingerprints: number;
}

export interface ReputationBadge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earnedAt?: number;
}

export interface AccountLinkRequest {
  requestId: string;
  userId: string;
  accountIdentifier: string;
  linkType: 'wallet' | 'email' | 'phone' | 'social';
  status: 'pending' | 'verified' | 'rejected';
  createdAt: number;
  verificationCode?: string;
}
