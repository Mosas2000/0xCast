/**
 * useLiquidityActions Hook
 * 
 * Custom hook for liquidity pool write operations (transactions).
 * Handles adding/removing liquidity and pool management.
 */

import { useCallback, useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { getContractPrincipal, CONTRACT_NAMES } from '../config/contracts';
import { useWallet } from '../components/WalletProvider';
import { safeBigIntToNumber } from './useContract';

function getLiquidityPoolContract() {
  return getContractPrincipal(CONTRACT_NAMES.LIQUIDITY_POOL);
}

interface TransactionState {
  isSubmitting: boolean;
  error: string | null;
  txId: string | null;
  success: boolean;
}

const initialState: TransactionState = {
  isSubmitting: false,
  error: null,
  txId: null,
  success: false,
};

export interface UseLiquidityActionsReturn {
  state: TransactionState;
  resetState: () => void;
  createPool: (marketId: number, initialStx: bigint) => Promise<void>;
  addLiquidity: (marketId: number, stxAmount: bigint) => Promise<void>;
  removeLiquidity: (marketId: number, shares: bigint) => Promise<void>;
}

export function useLiquidityActions(): UseLiquidityActionsReturn {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<TransactionState>(initialState);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const executeCall = useCallback(
    async (
      functionName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      functionArgs: any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      postConditions: any[] = [],
      postConditionMode: PostConditionMode = PostConditionMode.Deny
    ) => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      setState(prev => ({ ...prev, isSubmitting: true, error: null }));

      const contract = getLiquidityPoolContract();

      try {
        await openContractCall({
          contractAddress: contract.address,
          contractName: contract.name,
          functionName,
          functionArgs,
          postConditionMode,
          postConditions,
          onFinish: (data) => {
            console.log(`${functionName} completed:`, data);
            setState({
              isSubmitting: false,
              error: null,
              txId: data.txId,
              success: true,
            });
          },
          onCancel: () => {
            setState(prev => ({
              ...prev,
              isSubmitting: false,
              error: 'Transaction cancelled',
            }));
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [isConnected, address]
  );

  const createPool = useCallback(
    async (marketId: number, initialStx: bigint) => {
      if (!address) throw new Error('Wallet not connected');

      const postConditions = [
        Pc.principal(address).willSendEq(initialStx).ustx(),
      ];

      await executeCall(
        'create-pool',
        [uintCV(marketId), uintCV(safeBigIntToNumber(initialStx, 'initialStx'))],
        postConditions
      );
    },
    [executeCall, address]
  );

  const addLiquidity = useCallback(
    async (marketId: number, stxAmount: bigint) => {
      if (!address) throw new Error('Wallet not connected');

      const postConditions = [
        Pc.principal(address).willSendEq(stxAmount).ustx(),
      ];

      await executeCall(
        'add-liquidity',
        [uintCV(marketId), uintCV(safeBigIntToNumber(stxAmount, 'stxAmount'))],
        postConditions
      );
    },
    [executeCall, address]
  );

  const removeLiquidity = useCallback(
    async (marketId: number, shares: bigint) => {
      await executeCall(
        'remove-liquidity',
        [uintCV(marketId), uintCV(safeBigIntToNumber(shares, 'shares'))],
        [],
        PostConditionMode.Allow
      );
    },
    [executeCall]
  );

  return {
    state,
    resetState,
    createPool,
    addLiquidity,
    removeLiquidity,
  };
}
