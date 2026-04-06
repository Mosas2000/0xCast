/**
 * useMarketCreation Hook
 * 
 * Hook for creating prediction markets with state management.
 */

import { useState, useCallback } from 'react';
import { useContract } from './useContract';
import type { CreateMarketFormData } from '../types/market';

interface MarketCreationState {
  isCreating: boolean;
  error: string | null;
  txId: string | null;
  success: boolean;
}

interface UseMarketCreationReturn {
  createMarket: (data: CreateMarketFormData) => Promise<void>;
  state: MarketCreationState;
  resetState: () => void;
}

const initialState: MarketCreationState = {
  isCreating: false,
  error: null,
  txId: null,
  success: false,
};

export function useMarketCreation(): UseMarketCreationReturn {
  const { createMarket: createMarketContract } = useContract();
  const [state, setState] = useState<MarketCreationState>(initialState);

  const createMarket = useCallback(
    async (data: CreateMarketFormData) => {
      setState(prev => ({ ...prev, isCreating: true, error: null }));

      try {
        // Call contract method
        await createMarketContract(data.question, data.durationBlocks);

        setState(prev => ({
          ...prev,
          isCreating: false,
          success: true,
          error: null,
        }));
      } catch (error) {
        console.error('Market creation failed:', error);
        
        let errorMessage = 'Failed to create market. Please try again.';
        
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction was cancelled';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else {
            errorMessage = error.message;
          }
        }

        setState(prev => ({
          ...prev,
          isCreating: false,
          error: errorMessage,
          success: false,
        }));
        
        throw error;
      }
    },
    [createMarketContract]
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    createMarket,
    state,
    resetState,
  };
}
