import { useEffect, useState, useCallback } from 'react';
import { TxStatus } from '@stacks/connect';
import type { Market, Prediction } from '../types/market';

interface ReferralReward {
  id: string;
  amount: number;
  actionType: string;
  claimedAt?: number;
}

interface UseReferralIntegrationReturn {
  recordRewardOnAction: (actionAmount: number, actionType: string) => Promise<void>;
  triggerRewardIfReferred: (market: Market, prediction: Prediction) => Promise<void>;
  isPending: boolean;
  lastError: string | null;
  rewards: ReferralReward[];
}

export function useReferralIntegration(userAddress: string | null): UseReferralIntegrationReturn {
  const [isPending, setIsPending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);

  const recordRewardOnAction = useCallback(
    async (actionAmount: number, actionType: string) => {
      if (!userAddress) {
        setLastError('User address required');
        return;
      }

      setIsPending(true);
      setLastError(null);

      try {
        const rewardAmount = (actionAmount * 5) / 100;

        const newReward: ReferralReward = {
          id: `reward-${Date.now()}`,
          amount: rewardAmount,
          actionType,
        };

        setRewards((prev) => [...prev, newReward]);

        console.log(
          `Recorded reward: ${rewardAmount} for action type: ${actionType}`
        );
      } catch (err) {
        setLastError(
          err instanceof Error ? err.message : 'Failed to record reward'
        );
      } finally {
        setIsPending(false);
      }
    },
    [userAddress]
  );

  const triggerRewardIfReferred = useCallback(
    async (market: Market, prediction: Prediction) => {
      if (!userAddress) {
        setLastError('User address required');
        return;
      }

      setIsPending(true);
      setLastError(null);

      try {
        const actionAmount = prediction.amount || 0;

        if (actionAmount > 0) {
          await recordRewardOnAction(actionAmount, 'market-prediction');
          console.log(`Triggered reward for market prediction on market ${market.id}`);
        }
      } catch (err) {
        setLastError(
          err instanceof Error ? err.message : 'Failed to trigger reward'
        );
      } finally {
        setIsPending(false);
      }
    },
    [userAddress, recordRewardOnAction]
  );

  return {
    recordRewardOnAction,
    triggerRewardIfReferred,
    isPending,
    lastError,
    rewards,
  };
}
