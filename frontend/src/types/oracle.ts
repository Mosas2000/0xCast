/**
 * Oracle Types
 * 
 * Type definitions for oracle integration, disputes, and reputation system.
 * Used across the oracle dashboard and related components.
 */

/**
 * Oracle registration status and statistics
 */
export interface OracleStats {
  address: string;
  isRegistered: boolean;
  totalResolutions: number;
  successfulResolutions: number;
  disputedResolutions: number;
  reliability: number; // Percentage 0-100
}

/**
 * Oracle reputation data
 */
export interface OracleReputation {
  score: number;
  reliability: number;
  lastUpdate: number; // Block height
}

/**
 * Oracle configuration for a specific market
 */
export interface OracleSource {
  marketId: number;
  oracleType: string;
  dataFeed: string;
  thresholdPrice: number;
  configured: boolean;
}

/**
 * Price feed submitted by an oracle
 */
export interface PriceFeed {
  marketId: number;
  price: number;
  timestamp: number; // Block height
  oracle: string;
  confirmed: boolean;
}

/**
 * Market resolution record
 */
export interface MarketResolution {
  marketId: number;
  oracle: string;
  result: 1 | 2; // 1 = YES, 2 = NO
  resolvedAt: number; // Block height
  finalized: boolean;
  disputeEnd: number; // Block height when dispute period ends
}

/**
 * Dispute status constants
 */
export const DISPUTE_STATUS = {
  ACTIVE: 0,
  UPHELD: 1,
  REJECTED: 2,
} as const;

export type DisputeStatus = typeof DISPUTE_STATUS[keyof typeof DISPUTE_STATUS];

/**
 * Dispute vote constants
 */
export const VOTE = {
  YES: 1,
  NO: 2,
} as const;

export type VoteType = typeof VOTE[keyof typeof VOTE];

/**
 * Dispute record
 */
export interface Dispute {
  disputeId: number;
  marketId: number;
  disputer: string;
  stake: bigint;
  reason: string;
  status: DisputeStatus;
  createdAt: number; // Block height
  votingEnd: number; // Block height
  yesVotes: number;
  noVotes: number;
  totalVoters: number;
}

/**
 * Individual vote on a dispute
 */
export interface DisputeVote {
  marketId: number;
  voter: string;
  vote: VoteType;
  weight: number;
}

/**
 * Oracle settings (from contract data vars)
 */
export interface OracleSettings {
  disputePeriod: number; // Blocks
  votingPeriod: number; // Blocks
  minDisputeStake: bigint;
  disputeQuorum: number;
  oracleFee: bigint;
}

/**
 * Oracle action types for UI
 */
export const ORACLE_ACTIONS = {
  REGISTER_ORACLE: 'register-oracle',
  REMOVE_ORACLE: 'remove-oracle',
  CONFIGURE_SOURCE: 'configure-oracle-source',
  SUBMIT_PRICE: 'submit-price-feed',
  SUBMIT_RESOLUTION: 'submit-resolution',
  AUTO_RESOLVE: 'auto-resolve-with-oracle',
  FINALIZE: 'finalize-resolution',
  SUBMIT_DISPUTE: 'submit-dispute',
  VOTE_DISPUTE: 'vote-on-dispute',
  RESOLVE_DISPUTE: 'resolve-dispute',
} as const;

export type OracleAction = typeof ORACLE_ACTIONS[keyof typeof ORACLE_ACTIONS];

/**
 * Helper to format dispute status for display
 */
export function formatDisputeStatus(status: DisputeStatus): string {
  switch (status) {
    case DISPUTE_STATUS.ACTIVE:
      return 'Active';
    case DISPUTE_STATUS.UPHELD:
      return 'Upheld';
    case DISPUTE_STATUS.REJECTED:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

/**
 * Helper to get dispute status color
 */
export function getDisputeStatusColor(status: DisputeStatus): string {
  switch (status) {
    case DISPUTE_STATUS.ACTIVE:
      return 'text-yellow-500';
    case DISPUTE_STATUS.UPHELD:
      return 'text-green-500';
    case DISPUTE_STATUS.REJECTED:
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Calculate time remaining in dispute period
 */
export function getDisputeTimeRemaining(
  disputeEnd: number,
  currentBlock: number
): { blocks: number; isExpired: boolean } {
  const remaining = disputeEnd - currentBlock;
  return {
    blocks: Math.max(0, remaining),
    isExpired: remaining <= 0,
  };
}

/**
 * Format blocks to approximate time string
 */
export function formatBlocksToTime(blocks: number): string {
  const minutes = blocks * 10;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `~${days}d ${remainingHours}h`
      : `~${days} day${days !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `~${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `~${minutes} min${minutes !== 1 ? 's' : ''}`;
}

/**
 * Calculate oracle reliability percentage
 */
export function calculateReliability(stats: OracleStats): number {
  if (stats.totalResolutions === 0) return 100;
  return Math.round(
    ((stats.successfulResolutions) / stats.totalResolutions) * 100
  );
}

/**
 * Oracle provider configuration
 */
export interface OracleProvider {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  priority: number;
  healthScore: number;
  errorCount: number;
  successCount: number;
  lastUpdate?: number;
  lastError?: string;
}

/**
 * Oracle price data point
 */
export interface OraclePrice {
  value: number;
  timestamp: number;
  source: string;
  confidence: number;
}

/**
 * Aggregated price from multiple oracles
 */
export interface AggregatedPrice {
  value: number;
  timestamp: number;
  sources: OraclePrice[];
  confidence: number;
  consensusReached: boolean;
  method: string;
}

/**
 * Consensus calculation result
 */
export interface ConsensusResult {
  price: number;
  confidence: number;
  agreeingProviders: string[];
  dissagreeingProviders: string[];
  consensusLevel: 'strong' | 'moderate' | 'weak' | 'none';
}

/**
 * Oracle network state
 */
export interface OracleNetworkState {
  activeProviders: number;
  totalProviders: number;
  averageHealthScore: number;
  lastUpdate: number;
  consensusStrength: number;
  fallbackActive: boolean;
}

/**
 * Fallback strategy configuration
 */
export interface FallbackStrategy {
  enabled: boolean;
  type: 'last_known' | 'median_history' | 'weighted_history';
  maxAge: number;
  minimumConfidence: number;
}

/**
 * Oracle configuration
 */
export interface OracleConfig {
  consensusThreshold: number;
  minimumActiveProviders: number;
  aggregationMethod: 'median' | 'weighted_average';
  updateInterval: number;
  fallbackStrategy: FallbackStrategy;
  timeout: number;
  maxRetries: number;
}

/**
 * Price history entry
 */
export interface PriceHistory {
  price: number;
  timestamp: number;
  confidence: number;
}

/**
 * Oracle consensus level
 */
export type ConsensusLevel = 'strong' | 'moderate' | 'weak' | 'none';

/**
 * Oracle aggregation method
 */
export type AggregationMethod = 'median' | 'weighted_average' | 'trimmed_mean';
