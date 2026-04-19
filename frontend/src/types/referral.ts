export interface ReferralCode {
  code: string;
  owner: string;
  createdAt: number;
  active: boolean;
  totalReferrals: number;
}

export interface ReferralInfo {
  referrer?: string;
  referralCode: string;
  referredAt: number;
}

export interface AffiliateStats {
  totalReferred: number;
  totalEarned: number;
  totalClaimed: number;
  pendingRewards: number;
  activeReferrals: number;
  lastReferralBlock: number;
}

export interface ReferralReward {
  referralUser: string;
  rewardAmount: number;
  claimed: boolean;
  claimedAt?: number;
  actionType: string;
}

export interface ReferralTransaction {
  id: string;
  timestamp: number;
  type: 'referral' | 'claim' | 'pending';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  referralUser?: string;
  description: string;
}

export interface ReferralContext {
  referralCode: string | null;
  referralSource: 'url' | 'storage' | 'none';
  trackingId: string;
}

export interface ReferralConfig {
  contractAddress: string;
  network: string;
  baseRate: number;
  minThreshold: number;
}

export interface RecordRewardParams {
  referrer: string;
  referredUser: string;
  actionAmount: number;
  actionType: string;
}

export interface BatchRewardParams {
  referrer: string;
  referredUser: string;
  amount: number;
  actionType: string;
}

export interface ReferralError {
  code: number;
  message: string;
  context?: Record<string, any>;
}

export interface ReferralValidation {
  isValid: boolean;
  error?: ReferralError;
  code?: string;
  referrer?: string;
}

export interface CommissionTier {
  referrals: number;
  rate: number;
  benefits?: string[];
}

export interface ReferralStats {
  totalReferrals: number;
  totalRewardsDistributed: number;
  activeAffiliates: number;
  averageCommission: number;
  topAffiliates: string[];
}

export interface AffiliateReport {
  timestamp: string;
  user: string;
  totalReferred: number;
  totalEarned: number;
  totalClaimed: number;
  pendingRewards: number;
  commissionRate: number;
  estimatedMonthlyRewards: number;
}

export interface ReferralEvent {
  type: 'code-generated' | 'registered' | 'reward-recorded' | 'reward-claimed' | 'validation';
  user: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface ShareableReferralLink {
  code: string;
  link: string;
  shortLink?: string;
  expiresAt?: number;
  views: number;
  clicks: number;
  conversions: number;
}

export interface ReferralLeaderboardEntry {
  rank: number;
  user: string;
  referrals: number;
  earnings: number;
  commissionRate: number;
}

export interface ReferralNotification {
  id: string;
  type: 'reward' | 'tier-upgrade' | 'payout';
  title: string;
  message: string;
  amount?: number;
  read: boolean;
  timestamp: number;
}

export interface PendingRewardNotification extends ReferralNotification {
  type: 'reward';
  amount: number;
  actionType: string;
  referralUser: string;
}

export interface TierUpgradeNotification extends ReferralNotification {
  type: 'tier-upgrade';
  oldRate: number;
  newRate: number;
  requiredReferrals: number;
}

export interface PayoutNotification extends ReferralNotification {
  type: 'payout';
  amount: number;
  txHash: string;
}

export enum ReferralErrorCode {
  INVALID_CODE = 501,
  ALREADY_REFERRED = 502,
  SELF_REFERRAL = 503,
  INSUFFICIENT_REWARDS = 504,
  CODE_EXISTS = 505,
  INVALID_RATE = 506,
  ZERO_AMOUNT = 507,
  NOT_FOUND = 508,
  FRAUD_DETECTED = 509,
  OWNER_ONLY = 500,
}

export enum ActionType {
  MARKET_PREDICTION = 'market-prediction',
  LIQUIDITY_POOL = 'liquidity-pool',
  TRADING = 'trading',
  GOVERNANCE = 'governance',
  STAKING = 'staking',
}

export type ReferralHookReturn = {
  referralCode: string | null;
  stats: AffiliateStats | null;
  isLoading: boolean;
  error: string | null;
  generateCode: () => Promise<void>;
  registerWithCode: (code: string) => Promise<void>;
  claimRewards: () => Promise<void>;
  getReferrer: () => Promise<string | null>;
};

export type ReferralIntegrationHookReturn = {
  recordRewardOnAction: (actionAmount: number, actionType: string) => Promise<void>;
  triggerRewardIfReferred: (market: any, prediction: any) => Promise<void>;
  isPending: boolean;
  lastError: string | null;
  rewards: ReferralTransaction[];
};
