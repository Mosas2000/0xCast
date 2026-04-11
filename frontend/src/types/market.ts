export const MarketStatus = {
  ACTIVE: 0,
  RESOLVED: 1,
  DISPUTED: 2,
  REFUNDED: 3,
} as const;

export type MarketStatus = typeof MarketStatus[keyof typeof MarketStatus];

export const MarketOutcome = {
  NONE: 0,
  YES: 1,
  NO: 2,
} as const;

export type MarketOutcome = typeof MarketOutcome[keyof typeof MarketOutcome];

export interface Market {
  id: number;
  question: string;
  creator: string;
  endDate: number;
  resolutionDate: number;
  totalYesStake: number;
  totalNoStake: number;
  status: MarketStatus;
  outcome: MarketOutcome;
  createdAt: number;
}

export interface Position {
  marketId: number;
  user: string;
  yesStake: number;
  noStake: number;
  claimed: boolean;
}

export interface MultiOutcomeOption {
  index: number;
  name: string;
  stake: number;
  percentage: number;
}

export interface MultiMarket {
  id: number;
  question: string;
  creator: string;
  outcomes: MultiOutcomeOption[];
  outcomeCount: number;
  endDate: number;
  resolutionDate: number;
  status: number;
  winningOutcome: number | null;
  createdAt: number;
}

export function isMultiMarket(market: Market | MultiMarket): market is MultiMarket {
  return 'outcomes' in market;
}

export interface TransactionStatus {
  pending: boolean;
  success: boolean;
  error: string | null;
  txId: string | null;
}

// Market categories
export const MARKET_CATEGORIES = {
  CRYPTO: 'crypto',
  SPORTS: 'sports',
  POLITICS: 'politics',
  ECONOMICS: 'economics',
  TECHNOLOGY: 'technology',
  ENTERTAINMENT: 'entertainment',
  OTHER: 'other',
} as const;

export type MarketCategory = typeof MARKET_CATEGORIES[keyof typeof MARKET_CATEGORIES];

// Market duration presets (in blocks, ~10 min per block)
export const MARKET_DURATIONS = {
  ONE_DAY: 144,        // ~24 hours
  THREE_DAYS: 432,     // ~3 days
  ONE_WEEK: 1008,      // ~7 days
  TWO_WEEKS: 2016,     // ~14 days
  ONE_MONTH: 4320,     // ~30 days
  THREE_MONTHS: 12960, // ~90 days
} as const;

export type MarketDuration = typeof MARKET_DURATIONS[keyof typeof MARKET_DURATIONS];

// Market creation form data
export interface CreateMarketFormData {
  question: string;
  category: MarketCategory;
  durationBlocks: number;
  durationPreset?: keyof typeof MARKET_DURATIONS;
}

// Market validation result
export interface MarketValidationResult {
  isValid: boolean;
  errors: {
    question?: string;
    category?: string;
    duration?: string;
  };
}

// Category metadata
export interface CategoryMetadata {
  id: MarketCategory;
  label: string;
  description: string;
  icon: string;
}

export const CATEGORY_METADATA: Record<MarketCategory, CategoryMetadata> = {
  [MARKET_CATEGORIES.CRYPTO]: {
    id: MARKET_CATEGORIES.CRYPTO,
    label: 'Crypto',
    description: 'Cryptocurrency and blockchain predictions',
    icon: '₿',
  },
  [MARKET_CATEGORIES.SPORTS]: {
    id: MARKET_CATEGORIES.SPORTS,
    label: 'Sports',
    description: 'Sports events and outcomes',
    icon: '⚽',
  },
  [MARKET_CATEGORIES.POLITICS]: {
    id: MARKET_CATEGORIES.POLITICS,
    label: 'Politics',
    description: 'Political events and elections',
    icon: '🗳️',
  },
  [MARKET_CATEGORIES.ECONOMICS]: {
    id: MARKET_CATEGORIES.ECONOMICS,
    label: 'Economics',
    description: 'Economic indicators and market trends',
    icon: '📈',
  },
  [MARKET_CATEGORIES.TECHNOLOGY]: {
    id: MARKET_CATEGORIES.TECHNOLOGY,
    label: 'Technology',
    description: 'Tech releases and innovations',
    icon: '💻',
  },
  [MARKET_CATEGORIES.ENTERTAINMENT]: {
    id: MARKET_CATEGORIES.ENTERTAINMENT,
    label: 'Entertainment',
    description: 'Movies, music, and pop culture',
    icon: '🎬',
  },
  [MARKET_CATEGORIES.OTHER]: {
    id: MARKET_CATEGORIES.OTHER,
    label: 'Other',
    description: 'Miscellaneous predictions',
    icon: '🔮',
  },
};
