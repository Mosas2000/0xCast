/**
 * useMarketCreation Hook
 * 
 * Custom React hook for managing prediction market creation workflow.
 * 
 * Features:
 * - Manages creation state (loading, success, error)
 * - Handles contract interaction via useContract hook
 * - Provides human-readable error messages
 * - Supports state reset for retries
 * 
 * Usage:
 * ```tsx
 * const { createMarket, state, resetState } = useMarketCreation();
 * 
 * // Create a market
 * await createMarket({ question: 'Will BTC reach $100k?', durationBlocks: 1008 });
 * 
 * // Check state
 * if (state.isCreating) // Show loading
 * if (state.success) // Show success
 * if (state.error) // Show error message
 * ```
 */

import { useState, useCallback } from 'react';
import { useContract } from './useContract';
import type { CreateMarketFormData } from '../types/market';
import { useContractPause } from './useContractPause';

interface MarketCreationState {
  isCreating: boolean;
  error: string | null;
  txId: string | null;
  success: boolean;
}

interface UseMarketCreationReturn {
  createMarket: (data: CreateMarketFormData) => Promise<void>;
  state: MarketCreationState;
  isContractPaused: boolean;
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
  const { isPaused: isContractPaused } = useContractPause();
  const [state, setState] = useState<MarketCreationState>(initialState);

  const createMarket = useCallback(
    async (data: CreateMarketFormData) => {
      if (isContractPaused) {
        const pauseError = 'Market creation is temporarily paused by protocol administrators';
        setState(prev => ({ ...prev, isCreating: false, error: pauseError, success: false }));
        throw new Error(pauseError);
      }
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
    [createMarketContract, isContractPaused]
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    createMarket,
    state,
    isContractPaused,
    resetState,
  };
}
