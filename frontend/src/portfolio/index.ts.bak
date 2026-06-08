// frontend/src/portfolio/index.ts

// Types
export * from '@/types/portfolio';

// Services
export { PortfolioAnalysisService } from '@/services/PortfolioAnalysisService';
export { RecommendationEngineService } from '@/services/RecommendationEngineService';
export { PerformanceComparisonService } from '@/services/PerformanceComparisonService';

// Hooks
export {
  usePortfolioAnalysis,
  usePortfolioRecommendations,
  usePortfolioOptimization,
  usePerformanceComparison,
  usePortfolioRecommendationResponse,
} from '@/hooks/usePortfolioAnalysis';

// Utilities
export {
  formatCurrency,
  formatPercentage,
  calculateWeights,
  calculateAllocationPercentage,
  calculatePortfolioTurnover,
  calculateTransactionCost,
  calculateExpectedPortfolioReturn,
  findLargestPosition,
  findSmallestPosition,
  findBestPerformer,
  findWorstPerformer,
  isPositionUnderwater,
  isPositionOverweight,
  isPositionUnderweight,
  calculateStopLossPrice,
  calculateTakeProfitPrice,
  estimateBuyingPower,
  getRiskLevel,
  getPositionRating,
  sortPositionsByValue,
  sortPositionsByReturn,
  groupPositionsByMarket,
  isHighConcentration,
} from '@/utils/portfolioHelpers';

// Constants
export { PORTFOLIO_CONSTANTS } from '@/utils/portfolioConstants';
export {
  POSITION_RATINGS,
  RISK_LEVELS,
  REBALANCING_ACTIONS,
  RECOMMENDATION_TYPES,
  RECOMMENDATION_PRIORITIES,
  TIMEFRAMES,
  PERFORMANCE_PERIODS,
  BENCHMARK_NAMES,
  ALLOCATION_MODELS,
} from '@/utils/portfolioConstants';

// Validators
export { PortfolioValidator } from '@/utils/portfolioValidators';

// Formatters
export { PortfolioFormatters } from '@/utils/portfolioFormatters';

// Config
export { PORTFOLIO_CONFIG, PORTFOLIO_THRESHOLDS, PORTFOLIO_MESSAGES } from '@/config/portfolioConfig';

// Test fixtures
export {
  createMockPosition,
  createMockPortfolio,
  createMockPortfolioWithConcentration,
  createMockPortfolioWithLosses,
  createMockRiskMetrics,
  createMockRecommendation,
  createMockHighPriorityRecommendation,
  createMockLowPriorityRecommendation,
  createMockBenchmarkComparison,
  createMockOptimizationResult,
  createMockPortfolioAnalysis,
  fixtureData,
} from '@/utils/portfolioTestFixtures';
