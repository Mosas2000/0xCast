/**
 * useLiquidityRewards Hook
 * 
 * Custom hook for liquidity rewards operations.
 * Handles pending rewards, claiming, and reward tracking.
 * 
 * Features:
 * - Fetch pending rewards for a provider
 * - Get pool-level reward configuration
 * - Claim accumulated rewards
 * - Update pool reward state (admin)
 * - Transaction state tracking
 * 
 * Reward System:
 * The liquidity-rewards contract tracks rewards using an accumulated
 * reward-per-share model. As time passes, rewards accrue proportionally
 * to each provider's share of the pool. The accRewardPerShare increases
 * over time based on the rewardMultiplier and block height.
 * 
 * Usage:
 * ```tsx
 * const { state, getPendingRewards, claimRewards } = useLiquidityRewards();
 * 
 * // Check pending rewards
 * const rewards = await getPendingRewards(marketId, userAddress);
 * if (rewards?.claimable) {
 *   console.log(`You have ${rewards.amount} OXC to claim`);
 * }
 * 
 * // Claim rewards
 * await claimRewards(marketId);
 * 
 * // Check claim status
 * if (state.txId) {
 *   console.log('Claim submitted:', state.txId);
 * }
 * ```
 * 
 * Contract Functions:
 * - get-pending-rewards(market-id, provider) -> uint
 * - get-pool-rewards(market-id) -> { acc-reward-per-share, last-update-block, reward-multiplier }
 * - claim-rewards(market-id) -> (response bool uint)
 * - update-pool(market-id) -> (response bool uint) [admin only]
 * 
 * @see useLiquidity for pool data
 * @see useLiquidityActions for add/remove liquidity
 */

import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode } from '@stacks/transactions';
import { cvToValue, hexToCV } from '@stacks/transactions';
import { getContractPrincipal, CONTRACT_NAMES } from '../config/contracts';
import { getNodeUrl } from '../config/network';
import { useWallet } from '../components/WalletProvider';
import type { PendingRewards, PoolRewards } from '../types/liquidity';

function getLiquidityRewardsContract() {
  return getContractPrincipal(CONTRACT_NAMES.LIQUIDITY_REWARDS);
}

async function callReadOnly<T>(
  functionName: string,
  args: string[] = []
): Promise<T | null> {
  const contract = getLiquidityRewardsContract();
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

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.okay || !data.result) return null;

    const clarityValue = hexToCV(data.result);
    return cvToValue(clarityValue) as T;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    return null;
  }
}

function encodeUint(value: number): string {
  const hex = value.toString(16).padStart(32, '0');
  return `0x01${hex}`;
}

function encodePrincipal(address: string): string {
  return `0x0516${address}`;
}

interface RewardsState {
  isClaiming: boolean;
  error: string | null;
  txId: string | null;
}

const initialState: RewardsState = {
  isClaiming: false,
  error: null,
  txId: null,
};

export interface UseLiquidityRewardsReturn {
  state: RewardsState;
  resetState: () => void;
  getPendingRewards: (marketId: number, provider: string) => Promise<PendingRewards | null>;
  getPoolRewards: (marketId: number) => Promise<PoolRewards | null>;
  claimRewards: (marketId: number) => Promise<void>;
  updatePool: (marketId: number) => Promise<void>;
}

export function useLiquidityRewards(): UseLiquidityRewardsReturn {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<RewardsState>(initialState);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const getPendingRewards = useCallback(async (
    marketId: number,
    provider: string
  ): Promise<PendingRewards | null> => {
    try {
      const result = await callReadOnly<{ value: number } | number>(
        'get-pending-rewards',
        [encodeUint(marketId), encodePrincipal(provider)]
      );

      const amount = typeof result === 'object' && result !== null
        ? BigInt((result as { value: number }).value ?? 0)
        : BigInt(result ?? 0);

      return {
        marketId,
        provider,
        amount,
        claimable: amount > 0n,
      };
    } catch (err) {
      console.error('Error fetching pending rewards:', err);
      return null;
    }
  }, []);

  const getPoolRewards = useCallback(async (marketId: number): Promise<PoolRewards | null> => {
    try {
      const result = await callReadOnly<{
        'acc-reward-per-share': number;
        'last-update-block': number;
        'reward-multiplier': number;
      } | null>('get-pool-rewards', [encodeUint(marketId)]);

      if (!result) return null;

      return {
        marketId,
        accRewardPerShare: BigInt(result['acc-reward-per-share'] ?? 0),
        lastUpdateBlock: result['last-update-block'] ?? 0,
        rewardMultiplier: result['reward-multiplier'] ?? 1,
      };
    } catch (err) {
      console.error('Error fetching pool rewards:', err);
      return null;
    }
  }, []);

  const claimRewards = useCallback(async (marketId: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isClaiming: true, error: null }));

    const contract = getLiquidityRewardsContract();

    try {
      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
        functionName: 'claim-rewards',
        functionArgs: [uintCV(marketId)],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish: (data) => {
          console.log('Rewards claimed:', data);
          setState({
            isClaiming: false,
            error: null,
            txId: data.txId,
          });
        },
        onCancel: () => {
          setState(prev => ({
            ...prev,
            isClaiming: false,
            error: 'Transaction cancelled',
          }));
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim rewards';
      setState(prev => ({
        ...prev,
        isClaiming: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [isConnected, address]);

  const updatePool = useCallback(async (marketId: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const contract = getLiquidityRewardsContract();

    try {
      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
        functionName: 'update-pool',
        functionArgs: [uintCV(marketId)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          console.log('Pool updated:', data);
        },
        onCancel: () => {
          console.log('Pool update cancelled');
        },
      });
    } catch (error) {
      console.error('Error updating pool:', error);
      throw error;
    }
  }, [isConnected, address]);

  return {
    state,
    resetState,
    getPendingRewards,
    getPoolRewards,
    claimRewards,
    updatePool,
  };
}
