import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { MARKET_CONTRACT } from '../config/contracts';
import { stxToMicroStx, MIN_STAKE, MAX_STAKE } from '../constants';
import { useWallet } from '../components/WalletProvider';
import { validateAmount, validateMarketId } from '../utils/validation';
import { addStakeHistoryEntry, type StakeOutcome } from '../utils/stakeHistory';
import { useContractPause } from './useContractPause';
import { createRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

interface UseStakeReturn {
  placeYesStake: (marketId: number, amount: number, onSuccess?: () => void) => Promise<void>;
  placeNoStake: (marketId: number, amount: number, onSuccess?: () => void) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txId: string | null;
  isContractPaused: boolean;
  reset: () => void;
}

export function useStake(): UseStakeReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const { isPaused: isContractPaused, refetch: refetchPauseState } = useContractPause();

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxId(null);
  }, []);

  const placeStake = useCallback(
    async (
      marketId: number,
      amount: number,
      functionName: 'place-yes-stake' | 'place-no-stake',
      outcome: StakeOutcome,
      onSuccess?: () => void
    ) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }
      if (isContractPaused) {
        setError('Staking is temporarily paused by protocol administrators');
        return;
      }

      // Validate inputs before proceeding
      const marketIdValidation = validateMarketId(marketId);
      if (!marketIdValidation.isValid) {
        setError(marketIdValidation.error || 'Invalid market ID');
        return;
      }

      const amountValidation = validateAmount(amount, MIN_STAKE, MAX_STAKE);
      if (!amountValidation.isValid) {
        setError(amountValidation.error || 'ERR_MIN_STAKE_REQUIRED');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        const rateLimitMiddleware = createRateLimitMiddleware(address);
        
        await rateLimitMiddleware(
          'stake',
          async () => {},
          {
            onBlocked: (cooldownMs) => {
              throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(cooldownMs / 1000)} seconds.`);
            },
            onWarning: (remaining) => {
              console.warn(`Rate limit warning: ${remaining} requests remaining`);
            },
          }
        );

        const stakeMicroStx = stxToMicroStx(amount);

        // Post condition: user sends exact STX amount
        const postConditions = [
          Pc.principal(address).willSendEq(stakeMicroStx).ustx(),
        ];

        await openContractCall({
          contractAddress: MARKET_CONTRACT.address,
          contractName: MARKET_CONTRACT.name,
          functionName,
          functionArgs: [uintCV(marketId), uintCV(stakeMicroStx)],
          postConditionMode: PostConditionMode.Deny,
          postConditions,
          onFinish: (data) => {
            setTxId(data.txId);
            addStakeHistoryEntry({
              txId: data.txId,
              marketId,
              userAddress: address,
              outcome,
              amountStx: amount,
              timestamp: Date.now(),
            });
            setIsLoading(false);
            refetchPauseState();
            onSuccess?.();
          },
          onCancel: () => {
            setError('Transaction cancelled');
            setIsLoading(false);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to place stake');
        setIsLoading(false);
      }
    },
    [address, isContractPaused, refetchPauseState]
  );

  const placeYesStake = useCallback(
    (marketId: number, amount: number, onSuccess?: () => void) =>
      placeStake(marketId, amount, 'place-yes-stake', 'yes', onSuccess),
    [placeStake]
  );

  const placeNoStake = useCallback(
    (marketId: number, amount: number, onSuccess?: () => void) =>
      placeStake(marketId, amount, 'place-no-stake', 'no', onSuccess),
    [placeStake]
  );

  return { placeYesStake, placeNoStake, isLoading, error, txId, isContractPaused, reset };
}
