export const PORTFOLIO_CONSTANTS = {
  DEFAULT_RISK_FREE_RATE: 0.02,
  DEFAULT_LEVERAGE_RATIO: 2,
  DEFAULT_MAX_POSITION_SIZE: 0.3,
  DEFAULT_MIN_POSITION_SIZE: 0.01,
  DEFAULT_REBALANCE_THRESHOLD: 0.1,
  DEFAULT_TRANSACTION_FEE: 0.001,
  CASH_THRESHOLD: 0.05,
  DIVERSIFICATION_MIN_POSITIONS: 3,
  CONCENTRATION_RISK_THRESHOLD: 0.5,
  HIGH_VOLATILITY_THRESHOLD: 0.3,
  HIGH_DRAWDOWN_THRESHOLD: 0.2,
  RECOMMENDATION_EXPIRY_DAYS: 7,
  PERFORMANCE_LOOKBACK_DAYS: 252,
};

export const POSITION_RATINGS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  NEUTRAL: 'neutral',
  POOR: 'poor',
  CRITICAL: 'critical',
} as const;

export const RISK_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
} as const;

export const REBALANCING_ACTIONS = {
  BUY: 'buy',
  SELL: 'sell',
  INCREASE: 'increase',
  REDUCE: 'reduce',
} as const;

export const RECOMMENDATION_TYPES = {
  REBALANCING: 'rebalancing',
  DIVERSIFICATION: 'diversification',
  RISK_MANAGEMENT: 'risk_management',
  OPPORTUNITY: 'opportunity',
} as const;

export const RECOMMENDATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TIMEFRAMES = {
  IMMEDIATE: 'immediate',
  SHORT_TERM: 'short_term',
  MEDIUM_TERM: 'medium_term',
  LONG_TERM: 'long_term',
} as const;

export const PERFORMANCE_PERIODS = {
  ONE_DAY: '1d',
  ONE_WEEK: '1w',
  ONE_MONTH: '1m',
  THREE_MONTHS: '3m',
  SIX_MONTHS: '6m',
  ONE_YEAR: '1y',
} as const;

export const BENCHMARK_NAMES = {
  SP500: 'SP500',
  NASDAQ: 'NASDAQ',
  RUSSELL_2000: 'Russell 2000',
  MARKET_INDEX: 'Market Index',
  CRYPTO_INDEX: 'Crypto Index',
  BALANCED_INDEX: 'Balanced Index',
} as const;

export const BENCHMARK_RETURNS = {
  SP500: 0.12,
  NASDAQ: 0.15,
  'Russell 2000': 0.08,
  'Market Index': 0.1,
  'Crypto Index': 0.25,
  'Balanced Index': 0.09,
} as const;

export const ALLOCATION_MODELS = {
  CONSERVATIVE: {
    name: 'Conservative',
    description: 'Low risk, lower returns',
    riskLevel: 'conservative' as const,
    targetReturn: 0.06,
    targetVolatility: 0.08,
  },
  MODERATE: {
    name: 'Moderate',
    description: 'Balanced risk and returns',
    riskLevel: 'moderate' as const,
    targetReturn: 0.10,
    targetVolatility: 0.15,
  },
  AGGRESSIVE: {
    name: 'Aggressive',
    description: 'High risk, higher returns',
    riskLevel: 'aggressive' as const,
    targetReturn: 0.18,
    targetVolatility: 0.25,
  },
} as const;

export const STOP_LOSS_PERCENTAGES = {
  TIGHT: 5,
  MODERATE: 10,
  LOOSE: 20,
} as const;

export const TAKE_PROFIT_PERCENTAGES = {
  CONSERVATIVE: 10,
  MODERATE: 25,
  AGGRESSIVE: 50,
} as const;

export const REBALANCE_INTERVALS = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  QUARTERLY: 90,
  ANNUALLY: 365,
} as const;

export const VOLATILITY_PERCENTILES = {
  LOW: 0.1,
  MODERATE: 0.2,
  HIGH: 0.3,
  VERY_HIGH: 0.5,
} as const;

export const SHARPE_RATIO_RANGES = {
  EXCELLENT: 2,
  GOOD: 1,
  POSITIVE: 0,
  NEGATIVE: -Infinity,
} as const;
