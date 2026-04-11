import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV, listCV, PostConditionMode } from '@stacks/transactions';
import { useWallet } from '../components/WalletProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { MARKET_MULTI_CONTRACT } from '../config/contracts';

export interface CreateMultiMarketInput {
  question: string;
  outcomes: string[];
  endDate: number;
  resolutionDate: number;
}

interface MultiMarketCreationState {
  isCreating: boolean;
  error: string | null;
  success: boolean;
  txId: string | null;
}

const initialState: MultiMarketCreationState = {
  isCreating: false,
  error: null,
  success: false,
  txId: null,
};

export function useMultiMarketCreation() {
  const { isConnected } = useWallet();
  const { stacksNetwork } = useNetwork();
  const [state, setState] = useState<MultiMarketCreationState>(initialState);

  const createMultiMarket = useCallback(
    async (input: CreateMultiMarketInput) => {
      if (!isConnected) {
        setState({ ...initialState, error: 'Wallet not connected' });
        return;
      }

      if (input.outcomes.length < 3 || input.outcomes.length > 10) {
        setState({ ...initialState, error: 'Outcomes must be between 3 and 10' });
        return;
      }

      if (input.endDate >= input.resolutionDate) {
        setState({ ...initialState, error: 'Resolution date must be after end date' });
        return;
      }

      setState({ ...initialState, isCreating: true });

      try {
        await openContractCall({
          network: stacksNetwork,
          contractAddress: MARKET_MULTI_CONTRACT.address,
          contractName: MARKET_MULTI_CONTRACT.name,
          functionName: 'create-multi-market',
          functionArgs: [
            stringUtf8CV(input.question),
            listCV(input.outcomes.map((outcome) => stringUtf8CV(outcome))),
            uintCV(input.endDate),
            uintCV(input.resolutionDate),
          ],
          postConditionMode: PostConditionMode.Allow,
          postConditions: [],
          onFinish: (data) => {
            setState({ isCreating: false, error: null, success: true, txId: data.txId });
          },
          onCancel: () => {
            setState({ isCreating: false, error: 'Transaction cancelled', success: false, txId: null });
          },
        });
      } catch (error) {
        setState({
          isCreating: false,
          error: error instanceof Error ? error.message : 'Failed to create multi-outcome market',
          success: false,
          txId: null,
        });
      }
    },
    [isConnected, stacksNetwork]
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return { createMultiMarket, state, resetState };
}
