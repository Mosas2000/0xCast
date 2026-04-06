/**
 * useOracle Hook
 * 
 * Custom hook for reading oracle data from the blockchain.
 * Provides oracle statistics, resolutions, disputes, and settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { getContractPrincipal, CONTRACT_NAMES } from '../config/contracts';
import { getNodeUrl } from '../config/network';
import type {
  OracleStats,
  OracleReputation,
  OracleSource,
  PriceFeed,
  MarketResolution,
  Dispute,
  DisputeVote,
  OracleSettings,
  DisputeStatus,
  VoteType,
} from '../types/oracle';

/**
 * Get oracle contract configuration
 */
function getOracleContract() {
  return getContractPrincipal(CONTRACT_NAMES.ORACLE_INTEGRATION);
}

/**
 * Get oracle reputation contract configuration
 */
function getReputationContract() {
  return getContractPrincipal(CONTRACT_NAMES.ORACLE_REPUTATION);
}

/**
 * Make a read-only contract call
 */
async function callReadOnly<T>(
  contractName: string,
  functionName: string,
  args: string[] = []
): Promise<T | null> {
  const contract = contractName === 'oracle-reputation' 
    ? getReputationContract() 
    : getOracleContract();
  const apiUrl = getNodeUrl();

  const url = `${apiUrl}/v2/contracts/call-read/${contract.address}/${contract.name}/${functionName}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: contract.address,
        arguments: args,
      }),
    });

    if (!response.ok) {
      console.error(`Contract call failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.okay || !data.result) {
      return null;
    }

    const clarityValue = hexToCV(data.result);
    return cvToValue(clarityValue) as T;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    return null;
  }
}

/**
 * Encode a uint for Clarity arguments
 */
function encodeUint(value: number): string {
  const hex = value.toString(16).padStart(32, '0');
  return `0x01${hex}`;
}

/**
 * Encode a principal for Clarity arguments
 */
function encodePrincipal(address: string): string {
  // Simplified encoding - in production, use proper principal encoding
  return `0x0516${address}`;
}

export interface UseOracleReturn {
  // Data
  settings: OracleSettings | null;
  registeredOracles: string[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Read functions
  checkIsOracle: (address: string) => Promise<boolean>;
  getOracleStats: (address: string) => Promise<OracleStats | null>;
  getOracleReputation: (address: string) => Promise<OracleReputation | null>;
  getMarketResolution: (marketId: number) => Promise<MarketResolution | null>;
  getOracleSource: (marketId: number) => Promise<OracleSource | null>;
  getPriceFeed: (marketId: number) => Promise<PriceFeed | null>;
  getDispute: (marketId: number) => Promise<Dispute | null>;
  getDisputeVote: (marketId: number, voter: string) => Promise<DisputeVote | null>;
  isResolutionFinalized: (marketId: number) => Promise<boolean>;
  isInDisputePeriod: (marketId: number) => Promise<boolean>;
  
  // Refresh
  refreshSettings: () => Promise<void>;
}

export function useOracle(): UseOracleReturn {
  const [settings, setSettings] = useState<OracleSettings | null>(null);
  const [registeredOracles, setRegisteredOracles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch oracle settings
  const fetchSettings = useCallback(async () => {
    try {
      const [
        disputePeriod,
        votingPeriod,
        minDisputeStake,
        disputeQuorum,
      ] = await Promise.all([
        callReadOnly<number>('oracle-integration', 'get-dispute-period'),
        callReadOnly<number>('oracle-integration', 'get-voting-period'),
        callReadOnly<number>('oracle-integration', 'get-min-dispute-stake'),
        callReadOnly<number>('oracle-integration', 'get-dispute-counter'),
      ]);

      setSettings({
        disputePeriod: disputePeriod ?? 144,
        votingPeriod: votingPeriod ?? 288,
        minDisputeStake: BigInt(minDisputeStake ?? 5000000),
        disputeQuorum: disputeQuorum ?? 3,
        oracleFee: BigInt(5000000), // Default
      });
    } catch (err) {
      console.error('Error fetching oracle settings:', err);
      setError('Failed to load oracle settings');
    }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchSettings();
      setIsLoading(false);
    };
    init();
  }, [fetchSettings]);

  // Check if address is a registered oracle
  const checkIsOracle = useCallback(async (address: string): Promise<boolean> => {
    const result = await callReadOnly<boolean>(
      'oracle-integration',
      'is-registered-oracle',
      [encodePrincipal(address)]
    );
    return result ?? false;
  }, []);

  // Get oracle statistics
  const getOracleStats = useCallback(async (address: string): Promise<OracleStats | null> => {
    const [isOracle, stats] = await Promise.all([
      checkIsOracle(address),
      callReadOnly<{
        'total-resolutions': number;
        'successful-resolutions': number;
        'disputed-resolutions': number;
      }>('oracle-integration', 'get-oracle-stats', [encodePrincipal(address)]),
    ]);

    if (!stats) return null;

    const total = stats['total-resolutions'] ?? 0;
    const successful = stats['successful-resolutions'] ?? 0;

    return {
      address,
      isRegistered: isOracle,
      totalResolutions: total,
      successfulResolutions: successful,
      disputedResolutions: stats['disputed-resolutions'] ?? 0,
      reliability: total > 0 ? Math.round((successful / total) * 100) : 100,
    };
  }, [checkIsOracle]);

  // Get oracle reputation
  const getOracleReputation = useCallback(async (address: string): Promise<OracleReputation | null> => {
    const result = await callReadOnly<{
      score: number;
      reliability: number;
      'last-update': number;
    }>('oracle-reputation', 'get-reputation', [encodePrincipal(address)]);

    if (!result) return null;

    return {
      score: result.score ?? 100,
      reliability: result.reliability ?? 100,
      lastUpdate: result['last-update'] ?? 0,
    };
  }, []);

  // Get market resolution
  const getMarketResolution = useCallback(async (marketId: number): Promise<MarketResolution | null> => {
    const result = await callReadOnly<{
      oracle: string;
      result: number;
      'resolved-at': number;
      finalized: boolean;
      'dispute-end': number;
    } | null>('oracle-integration', 'get-market-resolution', [encodeUint(marketId)]);

    if (!result) return null;

    return {
      marketId,
      oracle: result.oracle,
      result: result.result as 1 | 2,
      resolvedAt: result['resolved-at'],
      finalized: result.finalized,
      disputeEnd: result['dispute-end'],
    };
  }, []);

  // Get oracle source configuration
  const getOracleSource = useCallback(async (marketId: number): Promise<OracleSource | null> => {
    const result = await callReadOnly<{
      'oracle-type': string;
      'data-feed': string;
      'threshold-price': number;
      configured: boolean;
    } | null>('oracle-integration', 'get-oracle-source', [encodeUint(marketId)]);

    if (!result) return null;

    return {
      marketId,
      oracleType: result['oracle-type'],
      dataFeed: result['data-feed'],
      thresholdPrice: result['threshold-price'],
      configured: result.configured,
    };
  }, []);

  // Get price feed
  const getPriceFeed = useCallback(async (marketId: number): Promise<PriceFeed | null> => {
    const result = await callReadOnly<{
      price: number;
      timestamp: number;
      oracle: string;
      confirmed: boolean;
    } | null>('oracle-integration', 'get-price-feed', [encodeUint(marketId)]);

    if (!result) return null;

    return {
      marketId,
      price: result.price,
      timestamp: result.timestamp,
      oracle: result.oracle,
      confirmed: result.confirmed,
    };
  }, []);

  // Get dispute
  const getDispute = useCallback(async (marketId: number): Promise<Dispute | null> => {
    const result = await callReadOnly<{
      'dispute-id': number;
      disputer: string;
      stake: number;
      reason: string;
      status: number;
      'created-at': number;
      'voting-end': number;
      'yes-votes': number;
      'no-votes': number;
      'total-voters': number;
    } | null>('oracle-integration', 'get-dispute', [encodeUint(marketId)]);

    if (!result) return null;

    return {
      disputeId: result['dispute-id'],
      marketId,
      disputer: result.disputer,
      stake: BigInt(result.stake),
      reason: result.reason,
      status: result.status as DisputeStatus,
      createdAt: result['created-at'],
      votingEnd: result['voting-end'],
      yesVotes: result['yes-votes'],
      noVotes: result['no-votes'],
      totalVoters: result['total-voters'],
    };
  }, []);

  // Get dispute vote
  const getDisputeVote = useCallback(async (marketId: number, voter: string): Promise<DisputeVote | null> => {
    const result = await callReadOnly<{
      vote: number;
      weight: number;
    } | null>('oracle-integration', 'get-dispute-vote', [
      encodeUint(marketId),
      encodePrincipal(voter),
    ]);

    if (!result) return null;

    return {
      marketId,
      voter,
      vote: result.vote as VoteType,
      weight: result.weight,
    };
  }, []);

  // Check if resolution is finalized
  const isResolutionFinalized = useCallback(async (marketId: number): Promise<boolean> => {
    const result = await callReadOnly<boolean>(
      'oracle-integration',
      'is-resolution-finalized',
      [encodeUint(marketId)]
    );
    return result ?? false;
  }, []);

  // Check if market is in dispute period
  const isInDisputePeriod = useCallback(async (marketId: number): Promise<boolean> => {
    const result = await callReadOnly<boolean>(
      'oracle-integration',
      'is-in-dispute-period',
      [encodeUint(marketId)]
    );
    return result ?? false;
  }, []);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchSettings();
    setIsLoading(false);
  }, [fetchSettings]);

  return {
    settings,
    registeredOracles,
    isLoading,
    error,
    checkIsOracle,
    getOracleStats,
    getOracleReputation,
    getMarketResolution,
    getOracleSource,
    getPriceFeed,
    getDispute,
    getDisputeVote,
    isResolutionFinalized,
    isInDisputePeriod,
    refreshSettings,
  };
}
