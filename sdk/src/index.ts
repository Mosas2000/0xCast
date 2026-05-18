/**
 * @oxcast/sdk
 *
 * JavaScript/TypeScript SDK for interacting with 0xCast prediction markets on Stacks.
 *
 * @example
 * ```ts
 * import { getContractIdentifier, calculateOdds, getTransactionUrl } from '@oxcast/sdk';
 *
 * const marketContract = getContractIdentifier('market-core', 'mainnet');
 * const odds = calculateOdds(500_000n, 300_000n);
 * const explorerLink = getTransactionUrl('0xabc...', 'mainnet');
 * ```
 */

// Types
export type {
  NetworkType,
  NetworkConfig,
  ContractName,
  ContractPrincipal,
  Market,
  MarketOdds,
  MarketOutcome,
  MarketStatus,
  Transaction,
  TransactionType,
  TransactionStatus,
  OxcastSDKConfig,
} from './types.js';

// Network
export {
  NETWORK_CONFIGS,
  DEFAULT_NETWORK,
  getStacksNetwork,
  getNetworkConfig,
  getApiUrl,
  getNodeUrl,
  isValidNetwork,
  getTransactionUrl,
  getAddressUrl,
  getContractUrl,
} from './network.js';

// Contracts
export {
  CONTRACT_NAMES,
  CONTRACT_ADDRESSES,
  getContractAddress,
  getContractIdentifier,
  getContractPrincipal,
  getAllContracts,
} from './contracts.js';

// Transactions
export {
  formatTransactionType,
  formatTransactionStatus,
  getStatusColor,
  getExplorerUrl,
  isTerminalStatus,
  isSuccessful,
  isPending,
} from './transactions.js';

// Markets
export {
  calculateOdds,
  calculatePayout,
  formatSTX,
  toMicroSTX,
  fromMicroSTX,
  isMarketOpen,
  isMarketResolved,
  getWinningOutcome,
} from './markets.js';

// ─── SDK Version ──────────────────────────────────────────────────────────────

export const SDK_VERSION = '1.0.0';
