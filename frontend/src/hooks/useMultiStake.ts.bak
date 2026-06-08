import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { stxToMicroStx, MIN_STAKE, MAX_STAKE } from '../constants';
import { useWallet } from '@/components/WalletProvider';
import { useNetwork } from '@/contexts/NetworkContext';
import { MARKET_MULTI_CONTRACT } from '@/config/contracts';
import { validateAmount, validateMarketId } from '@/utils/validation';
import { useContractPause } from './useContractPause';

interface UseMultiStakeReturn {
  placeOutcomeStake: (
    marketId: number,
    outcomeIndex: number,
    amount: number,
    onSuccess?: () => void
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txId: string | null;
  isContractPaused: boolean;
  reset: () => void;
}

export function useMultiStake(): UseMultiStakeReturn {
  const { address } = useWallet();
  const { stacksNetwork } = useNetwork();
  const { isPaused: isContractPaused } = useContractPause();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxId(null);
  }, []);

  const placeOutcomeStake = useCallback(
    async (marketId: number, outcomeIndex: number, amount: number, onSuccess?: () => void) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }
      if (isContractPaused) {
        setError('Staking is temporarily paused by protocol administrators');
        return;
      }

      const marketIdValidation = validateMarketId(marketId);
      if (!marketIdValidation.isValid) {
        setError(marketIdValidation.error || 'Invalid market ID');
        return;
      }

      if (!Number.isInteger(outcomeIndex) || outcomeIndex < 0) {
        setError('Invalid outcome index');
        return;
      }

      const amountValidation = validateAmount(amount, MIN_STAKE, MAX_STAKE);
      if (!amountValidation.isValid) {
        setError(amountValidation.error || 'Invalid stake amount');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        const stakeMicroStx = stxToMicroStx(amount);
        const postConditions = [Pc.principal(address).willSendEq(stakeMicroStx).ustx()];

        await openContractCall({
          network: stacksNetwork,
          contractAddress: MARKET_MULTI_CONTRACT.address,
          contractName: MARKET_MULTI_CONTRACT.name,
          functionName: 'stake-on-outcome',
          functionArgs: [uintCV(marketId), uintCV(outcomeIndex), uintCV(stakeMicroStx)],
          postConditionMode: PostConditionMode.Deny,
          postConditions,
          onFinish: (data) => {
            setTxId(data.txId);
            setIsLoading(false);
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
    [address, stacksNetwork, isContractPaused]
  );

  return { placeOutcomeStake, isLoading, error, txId, isContractPaused, reset };
}
