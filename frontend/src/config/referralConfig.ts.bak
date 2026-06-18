export const REFERRAL_CONFIG = {
  // Smart Contract Configuration
  CONTRACT: {
    NAME: 'referral-core',
    ADDRESS: process.env.REACT_APP_REFERRAL_CONTRACT_ADDRESS || '',
    NETWORK: process.env.REACT_APP_NETWORK || 'mainnet',
  },

  // Reward Configuration
  REWARDS: {
    BASE_RATE: 5, // 5% commission
    MIN_THRESHOLD: 100000, // 0.1 OXC in microunits
    CLAIM_INTERVAL: 1000, // 1 second cooldown between claims
  },

  // Tier Configuration
  TIERS: [
    { referrals: 5, rate: 5 },
    { referrals: 10, rate: 6 },
    { referrals: 25, rate: 7 },
    { referrals: 50, rate: 8 },
    { referrals: 100, rate: 10 },
  ],

  // Fraud Prevention
  FRAUD_PREVENTION: {
    COOLDOWN_BLOCKS: 144, // ~1 day
    MAX_REFERRALS: 1000,
    REFERRAL_EXPIRY_DAYS: 30,
    ENABLE_VALIDATION: true,
  },

  // Code Configuration
  CODE: {
    LENGTH: 16,
    CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    EXPIRY_DAYS: null, // null = never expire
  },

  // UI Configuration
  UI: {
    COMPACT_MODE: false,
    SHOW_ESTIMATED_EARNINGS: true,
    SHOW_TIER_INFO: true,
    MAX_HISTORY_ITEMS: 20,
    REFRESH_INTERVAL: 30000, // 30 seconds
  },

  // Storage Configuration
  STORAGE: {
    KEY_REFERRAL_CODE: 'oxcast_referral_code',
    KEY_TRACKING_ID: 'oxcast_tracking_id',
    KEY_TIMESTAMP: 'referral_timestamp',
  },

  // Analytics Configuration
  ANALYTICS: {
    ENABLE_GOOGLE_ANALYTICS: true,
    ENABLE_CUSTOM_EVENTS: true,
    TRACK_PAGE_VIEWS: true,
    TRACK_ACTIONS: true,
  },

  // API Configuration
  API: {
    ENDPOINTS: {
      GENERATE_CODE: '/api/referral/generate-code',
      REGISTER: '/api/referral/register',
      GET_STATS: '/api/referral/stats',
      CLAIM_REWARDS: '/api/referral/claim',
      RECORD_REWARD: '/api/referral/record-reward',
    },
    TIMEOUT: 30000,
  },

  // Feature Flags
  FEATURES: {
    ENABLE_REFERRAL_SYSTEM: true,
    ENABLE_EMAIL_INVITATIONS: true,
    ENABLE_SOCIAL_SHARING: true,
    ENABLE_REWARD_HISTORY: true,
    ENABLE_AFFILIATES_DASHBOARD: true,
    ENABLE_LEADERBOARD: false,
    ENABLE_BULK_OPERATIONS: false,
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      CODE_GENERATED: 'Referral code generated successfully',
      REGISTERED: 'Successfully registered with referral code',
      REWARDS_CLAIMED: 'Rewards claimed successfully',
      COPIED: 'Copied to clipboard',
    },
    ERROR: {
      INVALID_CODE: 'Invalid referral code',
      ALREADY_REFERRED: 'User already has a referrer',
      SELF_REFERRAL: 'Cannot refer yourself',
      INSUFFICIENT_REWARDS: 'Insufficient rewards to claim',
      NETWORK_ERROR: 'Network error, please try again',
      CONTRACT_ERROR: 'Contract error, please try again',
    },
    INFO: {
      PENDING_REWARDS: 'You have pending rewards to claim',
      REFERRAL_SYSTEM: 'Earn rewards by inviting friends',
      TIER_UPGRADE: 'You are eligible for a tier upgrade',
    },
  },

  // Validation Rules
  VALIDATION: {
    MIN_CODE_LENGTH: 6,
    MAX_CODE_LENGTH: 16,
    MIN_REFERRAL_AMOUNT: 100000, // 0.1 OXC
    MAX_BATCH_SIZE: 100,
  },

  // Rate Limits
  RATE_LIMITS: {
    GENERATE_CODE: 1000, // 1 per second
    CLAIM_REWARDS: 30000, // 1 per 30 seconds
    RECORD_REWARD: 100, // 10 per second
  },

  // Default Values
  DEFAULTS: {
    ESTIMATED_DAILY_ACTIVITY: 1000000, // 1 OXC in microunits
    DISPLAY_DECIMALS: 6,
    CURRENCY_SYMBOL: 'OXC',
  },

  // Social Sharing
  SOCIAL: {
    TWITTER_ENABLED: true,
    FACEBOOK_ENABLED: true,
    WHATSAPP_ENABLED: true,
    EMAIL_ENABLED: true,
    CUSTOM_MESSAGE: 'Join me on 0xCast! Use my referral code: {code}. Earn rewards!',
  },

  // Email Configuration
  EMAIL: {
    PROVIDER: process.env.REACT_APP_EMAIL_PROVIDER || 'sendgrid',
    FROM_ADDRESS: process.env.REACT_APP_EMAIL_FROM || 'noreply@0xcast.app',
    TEMPLATE_ID: process.env.REACT_APP_EMAIL_TEMPLATE_ID || '',
  },

  // Logging
  LOGGING: {
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
    LOG_CONTRACT_CALLS: true,
    LOG_TRACKING: true,
    LOG_ERRORS: true,
  },
};

// Helper functions
export function getReferralCodeLength(): number {
  return REFERRAL_CONFIG.CODE.LENGTH;
}

export function getCommissionRate(referralCount: number): number {
  const tier = REFERRAL_CONFIG.TIERS.find((t) => referralCount >= t.referrals);
  return tier?.rate ?? REFERRAL_CONFIG.REWARDS.BASE_RATE;
}

export function getFeatureFlag(feature: keyof typeof REFERRAL_CONFIG.FEATURES): boolean {
  return REFERRAL_CONFIG.FEATURES[feature];
}

export function getMessage(
  type: 'success' | 'error' | 'info',
  key: string
): string {
  const messages = REFERRAL_CONFIG.MESSAGES[type] as Record<string, string>;
  return messages[key] ?? '';
}

export function isReferralSystemEnabled(): boolean {
  return getFeatureFlag('ENABLE_REFERRAL_SYSTEM');
}

export function getContractAddress(): string {
  const address = REFERRAL_CONFIG.CONTRACT.ADDRESS;
  if (!address) {
    throw new Error('Referral contract address not configured');
  }
  return address;
}

export function getMinRewardThreshold(): number {
  return REFERRAL_CONFIG.REWARDS.MIN_THRESHOLD;
}

export function getBaseCommissionRate(): number {
  return REFERRAL_CONFIG.REWARDS.BASE_RATE;
}

export default REFERRAL_CONFIG;
