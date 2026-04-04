import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { MARKET_CONTRACT } from '../config/contracts';
import { stxToMicroStx } from '../constants';
import { useWallet } from '../components/WalletProvider';

interface UseStakeReturn {
  placeYesStake: (marketId: number, amount: number, onSuccess?: () => void) => Promise<void>;
  placeNoStake: (marketId: number, amount: number, onSuccess?: () => void) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txId: string | null;
  reset: () => void;
}

export function useStake(): UseStakeReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

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
      onSuccess?: () => void
    ) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
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
    [address]
  );

  const placeYesStake = useCallback(
    (marketId: number, amount: number, onSuccess?: () => void) =>
      placeStake(marketId, amount, 'place-yes-stake', onSuccess),
    [placeStake]
  );

  const placeNoStake = useCallback(
    (marketId: number, amount: number, onSuccess?: () => void) =>
      placeStake(marketId, amount, 'place-no-stake', onSuccess),
    [placeStake]
  );

  return { placeYesStake, placeNoStake, isLoading, error, txId, reset };
}
