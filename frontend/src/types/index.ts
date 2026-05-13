/**
 * Type Definitions Index
 * 
 * Central export point for all type definitions used in the 0xCast application.
 * Import types from this file for consistency and easier refactoring.
 * 
 * @example
 * ```typescript
 * // Good - import from index
 * import { Market, MarketStatus, MarketOutcome } from '@/types';
 * 
 * // Also works - import from specific file
 * import { Market } from '@/types/market';
 * ```
 */

// Market types and enums
export {
  MarketStatus,
  MarketOutcome,
  isMarketStatus,
  isMarketOutcome,
  getMarketStatusLabel,
  getMarketOutcomeLabel,
  canAcceptPredictions,
  canResolveMarket,
  canClaimWinnings,
  isMarket,
  isPrediction,
  type Market,
  type Prediction,
  type MarketStatistics,
  type Pool,
  type PoolModel,
  type PoolParameters,
} from './market';

// Re-export commonly used types for convenience
export type { Market as IMarket } from './market';
export type { Prediction as IPrediction } from './market';
