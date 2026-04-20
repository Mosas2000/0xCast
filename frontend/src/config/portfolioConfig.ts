// frontend/src/config/portfolioConfig.ts

export const PORTFOLIO_CONFIG = {
  // Analysis configuration
  ANALYSIS: {
    MIN_POSITIONS_FOR_ANALYSIS: 1,
    MIN_POSITIONS_FOR_DIVERSIFICATION: 2,
    LOOKBACK_PERIOD_DAYS: 252,
    REBALANCE_FREQUENCY_DAYS: 30,
    CACHE_DURATION_MINUTES: 5,
  },

  // Risk configuration
  RISK: {
    DEFAULT_RISK_FREE_RATE: 0.02,
    VOLATILITY_WINDOW_DAYS: 30,
    DRAWDOWN_LOOKBACK_DAYS: 252,
    MAX_POSITION_SIZE_AGGRESSIVE: 0.5,
    MAX_POSITION_SIZE_MODERATE: 0.33,
    MAX_POSITION_SIZE_CONSERVATIVE: 0.25,
    MIN_POSITION_SIZE: 0.01,
    CONCENTRATION_WARNING_THRESHOLD: 0.5,
    CONCENTRATION_CRITICAL_THRESHOLD: 0.7,
  },

  // Recommendation configuration
  RECOMMENDATIONS: {
    MIN_CONFIDENCE_THRESHOLD: 0.6,
    MAX_CONCURRENT_RECOMMENDATIONS: 10,
    RECOMMENDATION_EXPIRY_DAYS: 7,
    REBALANCE_WEIGHT_THRESHOLD: 0.1,
    DIVERSIFICATION_THRESHOLD: 0.6,
    LOSS_THRESHOLD_FOR_RISK_MGMT: -0.1,
    GAIN_THRESHOLD_FOR_OPPORTUNITY: 0.15,
    UPDATE_FREQUENCY_MINUTES: 60,
  },

  // Transaction configuration
  TRANSACTION: {
    DEFAULT_FEE_PERCENTAGE: 0.001,
    MIN_TRADE_SIZE: 1,
    MAX_SLIPPAGE_PERCENTAGE: 0.02,
    EXECUTION_TIMEOUT_SECONDS: 30,
  },

  // Performance configuration
  PERFORMANCE: {
    BENCHMARK_TYPES: ['SP500', 'NASDAQ', 'Russell 2000', 'Market Index', 'Crypto Index', 'Balanced Index'],
    DEFAULT_BENCHMARK: 'SP500',
    METRIC_UPDATE_INTERVAL_MINUTES: 15,
    PERFORMANCE_LOOKBACK_DAYS: 252,
  },

  // Optimization configuration
  OPTIMIZATION: {
    SOLVER_ITERATIONS: 1000,
    CONVERGENCE_TOLERANCE: 0.001,
    MAX_ITERATIONS: 100,
    OPTIMIZATION_TIMEOUT_SECONDS: 10,
    TARGET_ALLOCATION_METHOD: 'equal_weight',
  },

  // UI configuration
  UI: {
    CHART_DEFAULT_HEIGHT: 400,
    CHART_DEFAULT_WIDTH: 800,
    CARD_ANIMATION_DURATION_MS: 300,
    TOAST_DURATION_MS: 5000,
    LOADING_SKELETON_SHIMMER_SPEED: 1.5,
    MAX_RECOMMENDATIONS_PER_VIEW: 5,
    PAGINATION_SIZE: 20,
  },

  // Storage configuration
  STORAGE: {
    RECOMMENDATION_HISTORY_DAYS: 90,
    PERFORMANCE_DATA_RETENTION_DAYS: 365,
    CACHE_TTL_MINUTES: 10,
  },

  // Alert configuration
  ALERTS: {
    HIGH_CONCENTRATION_THRESHOLD: 0.6,
    HIGH_VOLATILITY_THRESHOLD: 0.3,
    LARGE_DRAWDOWN_THRESHOLD: 0.2,
    POOR_DIVERSIFICATION_THRESHOLD: 0.5,
    NEGATIVE_RETURN_THRESHOLD: -0.1,
  },

  // Analytics configuration
  ANALYTICS: {
    TRACK_RECOMMENDATIONS: true,
    TRACK_OPTIMIZATIONS: true,
    TRACK_EXECUTION: true,
    TRACK_PERFORMANCE: true,
  },
};

export const PORTFOLIO_THRESHOLDS = {
  VOLATILITY_LEVELS: {
    LOW: { max: 0.1, label: 'Low', color: '#4caf50' },
    MODERATE: { max: 0.2, label: 'Moderate', color: '#ff9800' },
    HIGH: { max: 0.3, label: 'High', color: '#ff5722' },
    VERY_HIGH: { max: Infinity, label: 'Very High', color: '#f44336' },
  },

  SHARPE_RATIO_LEVELS: {
    EXCELLENT: { min: 2, label: 'Excellent', color: '#4caf50' },
    GOOD: { min: 1, label: 'Good', color: '#8bc34a' },
    POSITIVE: { min: 0, label: 'Positive', color: '#2196f3' },
    NEUTRAL: { min: -0.5, label: 'Neutral', color: '#9c27b0' },
    NEGATIVE: { min: -Infinity, label: 'Negative', color: '#f44336' },
  },

  DIVERSIFICATION_LEVELS: {
    EXCELLENT: { min: 80, label: 'Excellent Diversification', color: '#4caf50' },
    GOOD: { min: 60, label: 'Good Diversification', color: '#8bc34a' },
    FAIR: { min: 40, label: 'Fair Diversification', color: '#ff9800' },
    POOR: { min: 0, label: 'Poor Diversification', color: '#f44336' },
  },

  DRAWDOWN_LEVELS: {
    MINIMAL: { max: -0.05, label: 'Minimal', color: '#4caf50' },
    MODERATE: { max: -0.15, label: 'Moderate', color: '#ff9800' },
    SIGNIFICANT: { max: -0.3, label: 'Significant', color: '#ff5722' },
    SEVERE: { max: -Infinity, label: 'Severe', color: '#f44336' },
  },

  CONCENTRATION_LEVELS: {
    WELL_DIVERSIFIED: { max: 0.3, label: 'Well Diversified', color: '#4caf50' },
    ACCEPTABLE: { max: 0.5, label: 'Acceptable', color: '#8bc34a' },
    ELEVATED: { max: 0.7, label: 'Elevated Risk', color: '#ff9800' },
    HIGH: { max: 1, label: 'High Concentration Risk', color: '#f44336' },
  },
};

export const PORTFOLIO_MESSAGES = {
  SUCCESS: {
    ANALYSIS_COMPLETE: 'Portfolio analysis complete',
    RECOMMENDATIONS_GENERATED: 'Recommendations generated successfully',
    OPTIMIZATION_COMPLETE: 'Portfolio optimization complete',
    COMPARISON_COMPLETE: 'Benchmark comparison complete',
    CHANGES_APPLIED: 'Changes applied successfully',
  },

  ERROR: {
    INVALID_PORTFOLIO: 'Invalid portfolio data',
    ANALYSIS_FAILED: 'Failed to analyze portfolio',
    RECOMMENDATIONS_FAILED: 'Failed to generate recommendations',
    OPTIMIZATION_FAILED: 'Failed to optimize portfolio',
    COMPARISON_FAILED: 'Failed to compare with benchmark',
    INVALID_POSITION: 'Invalid position data',
    INSUFFICIENT_DATA: 'Insufficient data for analysis',
  },

  WARNING: {
    HIGH_CONCENTRATION: 'High concentration risk detected',
    HIGH_VOLATILITY: 'Portfolio volatility is high',
    LARGE_DRAWDOWN: 'Portfolio has experienced significant drawdown',
    POOR_DIVERSIFICATION: 'Portfolio lacks proper diversification',
    INSUFFICIENT_POSITIONS: 'Add more positions for better diversification',
  },

  INFO: {
    ANALYZING_PORTFOLIO: 'Analyzing your portfolio...',
    GENERATING_RECOMMENDATIONS: 'Generating recommendations...',
    OPTIMIZING_PORTFOLIO: 'Optimizing your portfolio...',
    COMPARING_PERFORMANCE: 'Comparing performance with benchmarks...',
    LOADING_DATA: 'Loading portfolio data...',
  },
};

export const RECOMMENDATION_MESSAGES = {
  REBALANCING: {
    title: 'Rebalance Portfolio',
    description: 'Your portfolio is out of balance. These adjustments will bring your positions closer to target weights.',
    benefit: 'Better alignment with target allocation and reduced drift',
  },
  DIVERSIFICATION: {
    title: 'Improve Diversification',
    description: 'Your portfolio is concentrated in a few positions. Consider diversifying to reduce risk.',
    benefit: 'Lower concentration risk and better portfolio resilience',
  },
  RISK_MANAGEMENT: {
    title: 'Reduce Risk Exposure',
    description: 'Some positions are underperforming significantly. Consider reducing exposure.',
    benefit: 'Lower portfolio volatility and better risk management',
  },
  OPPORTUNITY: {
    title: 'Capture Opportunities',
    description: 'These positions are showing strong momentum. Consider increasing exposure.',
    benefit: 'Higher potential returns while maintaining balance',
  },
};

export default PORTFOLIO_CONFIG;
