/**
 * useLiquidity Hook
 * 
 * Custom hook for reading liquidity pool data from the blockchain.
 * Provides pool information, LP positions, and analytics.
 * 
 * Features:
 * - Fetch liquidity pool details
 * - Get user's LP balance and position
 * - Calculate pool statistics
 * - Read fee configuration
 * 
 * Usage:
 * ```tsx
 * const { getPool, getLPBalance, isLoading } = useLiquidity();
 * 
 * // Get pool for a market
 * const pool = await getPool(1);
 * 
 * // Get user's LP balance
 * const balance = await getLPBalance(1, 'SP...');
 * ```
 */

import { useState, useCallback } from 'react';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { getContractPrincipal, CONTRACT_NAMES } from '../config/contracts';
import { getNodeUrl } from '../config/network';
import type {
  LiquidityPool,
  LPPosition,
  PoolStats,
  FeeConfig,
} from '../types/liquidity';
import { calculateSharePercentage, calculatePositionValue, DEFAULT_FEE_CONFIG } from '../types/liquidity';

/**
 * Get liquidity pool contract configuration
 */
function getLiquidityPoolContract() {
  return getContractPrincipal(CONTRACT_NAMES.LIQUIDITY_POOL);
}

/**
 * Make a read-only contract call
 */
async function callReadOnly<T>(
  functionName: string,
  args: string[] = []
): Promise<T | null> {
  const contract = getLiquidityPoolContract();
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
  return `0x0516${address}`;
}

export interface UseLiquidityReturn {
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Fee config
  feeConfig: FeeConfig;
  
  // Read functions
  getPool: (marketId: number) => Promise<LiquidityPool | null>;
  getLPBalance: (marketId: number, provider: string) => Promise<bigint>;
  getLPPosition: (marketId: number, provider: string) => Promise<LPPosition | null>;
  getPoolStats: (marketId: number) => Promise<PoolStats | null>;
  getOutputAmount: (inputAmount: bigint, inputReserve: bigint, outputReserve: bigint) => Promise<bigint>;
}

export function useLiquidity(): UseLiquidityReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feeConfig] = useState<FeeConfig>(DEFAULT_FEE_CONFIG);

  // Get liquidity pool details
  const getPool = useCallback(async (marketId: number): Promise<LiquidityPool | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await callReadOnly<{
        'stx-balance': number;
        'total-shares': number;
        active: boolean;
      } | null>('get-pool', [encodeUint(marketId)]);

      if (!result) return null;

      return {
        marketId,
        stxBalance: BigInt(result['stx-balance'] ?? 0),
        tokenBalances: [],
        totalShares: BigInt(result['total-shares'] ?? 0),
        active: result.active ?? false,
      };
    } catch (err) {
      console.error('Error fetching pool:', err);
      setError('Failed to fetch pool data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get LP balance for a user
  const getLPBalance = useCallback(async (marketId: number, provider: string): Promise<bigint> => {
    try {
      const result = await callReadOnly<number>(
        'get-lp-balance',
        [encodeUint(marketId), encodePrincipal(provider)]
      );
      return BigInt(result ?? 0);
    } catch (err) {
      console.error('Error fetching LP balance:', err);
      return 0n;
    }
  }, []);

  // Get full LP position with calculated values
  const getLPPosition = useCallback(async (marketId: number, provider: string): Promise<LPPosition | null> => {
    try {
      const [pool, balance] = await Promise.all([
        getPool(marketId),
        getLPBalance(marketId, provider),
      ]);

      if (!pool) return null;

      const sharePercentage = calculateSharePercentage(balance, pool.totalShares);
      const estimatedValue = calculatePositionValue(balance, pool.totalShares, pool.stxBalance);

      return {
        marketId,
        provider,
        shares: balance,
        sharePercentage,
        estimatedValue,
      };
    } catch (err) {
      console.error('Error fetching LP position:', err);
      return null;
    }
  }, [getPool, getLPBalance]);

  // Get pool statistics
  const getPoolStats = useCallback(async (marketId: number): Promise<PoolStats | null> => {
    try {
      const pool = await getPool(marketId);
      
      if (!pool) return null;

      // In production, these would come from indexed data or events
      return {
        marketId,
        tvl: pool.stxBalance,
        volume24h: 0n, // Would need indexer
        fees24h: 0n, // Would need indexer
        apy: 0, // Calculate from rewards contract
        lpCount: 0, // Would need indexer
      };
    } catch (err) {
      console.error('Error fetching pool stats:', err);
      return null;
    }
  }, [getPool]);

  // Calculate output amount using contract's CPMM formula
  const getOutputAmount = useCallback(async (
    inputAmount: bigint,
    inputReserve: bigint,
    outputReserve: bigint
  ): Promise<bigint> => {
    try {
      const result = await callReadOnly<number>(
        'get-output-amount',
        [
          encodeUint(Number(inputAmount)),
          encodeUint(Number(inputReserve)),
          encodeUint(Number(outputReserve)),
        ]
      );
      return BigInt(result ?? 0);
    } catch (err) {
      console.error('Error calculating output amount:', err);
      return 0n;
    }
  }, []);

  return {
    isLoading,
    error,
    feeConfig,
    getPool,
    getLPBalance,
    getLPPosition,
    getPoolStats,
    getOutputAmount,
  };
}
