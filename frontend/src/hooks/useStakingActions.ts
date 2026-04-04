// Staking actions hook for stake/unstake operations
import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { TOKEN_CONTRACT } from '../config/contracts';
import { useWallet } from '../components/WalletProvider';

interface UseStakingActionsReturn {
  stake: (amount: bigint, onSuccess?: () => void) => Promise<void>;
  unstake: (amount: bigint, onSuccess?: () => void) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txId: string | null;
  reset: () => void;
}

export function useStakingActions(): UseStakingActionsReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxId(null);
  }, []);

  const stake = useCallback(
    async (amount: bigint, onSuccess?: () => void) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        // Post condition: user sends OXC tokens to contract
        const postConditions = [
          Pc.principal(address)
            .willSendEq(amount)
            .ft(TOKEN_CONTRACT.identifier as `${string}.${string}`, 'oxc-token'),
        ];

        await openContractCall({
          contractAddress: TOKEN_CONTRACT.address,
          contractName: TOKEN_CONTRACT.name,
          functionName: 'stake',
          functionArgs: [uintCV(Number(amount))],
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
        setError(err instanceof Error ? err.message : 'Failed to stake');
        setIsLoading(false);
      }
    },
    [address]
  );

  const unstake = useCallback(
    async (amount: bigint, onSuccess?: () => void) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        await openContractCall({
          contractAddress: TOKEN_CONTRACT.address,
          contractName: TOKEN_CONTRACT.name,
          functionName: 'unstake',
          functionArgs: [uintCV(Number(amount))],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
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
        setError(err instanceof Error ? err.message : 'Failed to unstake');
        setIsLoading(false);
      }
    },
    [address]
  );

  return { stake, unstake, isLoading, error, txId, reset };
}
