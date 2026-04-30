// Staking actions hook for stake/unstake operations
import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { TOKEN_CONTRACT } from '../config/contracts';
import { useWallet } from '../components/WalletProvider';
import { safeBigIntToNumber, validateTransactionAmount } from './useContract';
import { parseContractError, getUserFriendlyContractError } from '../utils/contractErrorHandler';
import { errorLoggingService } from '../services/ErrorLoggingService';

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

      // Validate amount before proceeding
      const amountValidation = validateTransactionAmount(amount);
      if (!amountValidation.isValid) {
        setError(amountValidation.error || 'Invalid stake amount');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        // Safe conversion for contract call
        const safeAmount = safeBigIntToNumber(amount);
        
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
          functionArgs: [uintCV(safeAmount)],
          postConditionMode: PostConditionMode.Deny,
          postConditions,
          onFinish: (data) => {
            setTxId(data.txId);
            setIsLoading(false);
            onSuccess?.();
          },
          onCancel: () => {
            const cancelError = parseContractError(
              new Error('User cancelled transaction'),
              TOKEN_CONTRACT.name,
              'stake'
            );
            setError(getUserFriendlyContractError(cancelError));
            setIsLoading(false);
          },
        });
      } catch (err) {
        const contractError = parseContractError(err, TOKEN_CONTRACT.name, 'stake');
        const friendlyMessage = getUserFriendlyContractError(contractError);
        
        errorLoggingService.logError(contractError, {
          component: 'useStakingActions',
          action: 'stake',
          additionalData: { amount: amount.toString() },
        });
        
        setError(friendlyMessage);
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

      // Validate amount before proceeding
      const amountValidation = validateTransactionAmount(amount);
      if (!amountValidation.isValid) {
        setError(amountValidation.error || 'Invalid unstake amount');
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        // Safe conversion for contract call
        const safeAmount = safeBigIntToNumber(amount);
        
        await openContractCall({
          contractAddress: TOKEN_CONTRACT.address,
          contractName: TOKEN_CONTRACT.name,
          functionName: 'unstake',
          functionArgs: [uintCV(safeAmount)],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
          onFinish: (data) => {
            setTxId(data.txId);
            setIsLoading(false);
            onSuccess?.();
          },
          onCancel: () => {
            const cancelError = parseContractError(
              new Error('User cancelled transaction'),
              TOKEN_CONTRACT.name,
              'unstake'
            );
            setError(getUserFriendlyContractError(cancelError));
            setIsLoading(false);
          },
        });
      } catch (err) {
        const contractError = parseContractError(err, TOKEN_CONTRACT.name, 'unstake');
        const friendlyMessage = getUserFriendlyContractError(contractError);
        
        errorLoggingService.logError(contractError, {
          component: 'useStakingActions',
          action: 'unstake',
          additionalData: { amount: amount.toString() },
        });
        
        setError(friendlyMessage);
        setIsLoading(false);
      }
    },
    [address]
  );

  return { stake, unstake, isLoading, error, txId, reset };
}
