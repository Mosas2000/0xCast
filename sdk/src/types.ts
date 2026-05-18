/**
 * Core types for the 0xCast SDK
 */

// ─── Network ────────────────────────────────────────────────────────────────

export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  name: NetworkType;
  label: string;
  chainId: number;
  apiUrl: string;
  nodeUrl: string;
  explorerUrl: string;
}

// ─── Contracts ───────────────────────────────────────────────────────────────

export type ContractName =
  | 'market-core'
  | 'oxcast'
  | 'governance-core'
  | 'governance-token'
  | 'liquidity-pool'
  | 'liquidity-rewards'
  | 'oracle-integration'
  | 'oracle-reputation'
  | 'access-control'
  | 'market-fees'
  | 'market-multi';

export interface ContractPrincipal {
  address: string;
  name: ContractName;
  /** Fully qualified identifier: `address.name` */
  identifier: string;
}

// ─── Markets ─────────────────────────────────────────────────────────────────

export type MarketOutcome = 'yes' | 'no';

export type MarketStatus = 'open' | 'closed' | 'resolved' | 'disputed';

export interface Market {
  id: number;
  title: string;
  description: string;
  creator: string;
  status: MarketStatus;
  yesPool: bigint;
  noPool: bigint;
  totalPool: bigint;
  resolvedOutcome?: MarketOutcome;
  createdAt: number;
  closesAt: number;
}

export interface MarketOdds {
  yes: number;
  no: number;
  yesImpliedProbability: number;
  noImpliedProbability: number;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType =
  | 'stake'
  | 'unstake'
  | 'predict_yes'
  | 'predict_no'
  | 'claim_winnings'
  | 'transfer'
  | 'create_market'
  | 'vote';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'dropped';

export interface Transaction {
  txId: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  amount?: string;
  marketId?: number;
  description: string;
  blockHeight?: number;
  error?: string;
}

// ─── SDK Config ───────────────────────────────────────────────────────────────

export interface OxcastSDKConfig {
  /** Network to connect to. Defaults to 'mainnet'. */
  network?: NetworkType;
}
