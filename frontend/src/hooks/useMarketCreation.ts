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
import { useRateLimit } from './useRateLimit';
import { parseContractError, getUserFriendlyContractError } from '../utils/contractErrorHandler';
import { errorLoggingService } from '../services/ErrorLoggingService';
import { MARKET_CONTRACT } from '../config/contracts';

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
  const { checkRateLimit } = useRateLimit();
  const [state, setState] = useState<MarketCreationState>(initialState);

  const createMarket = useCallback(
    async (data: CreateMarketFormData) => {
      if (isContractPaused) {
        const pauseError = 'Market creation is temporarily paused by protocol administrators';
        setState(prev => ({ ...prev, isCreating: false, error: pauseError, success: false }));
        throw new Error(pauseError);
      }

      const rateLimitResult = await checkRateLimit('create-market');
      if (!rateLimitResult.allowed) {
        const rateLimitError = rateLimitResult.reason || 'Rate limit exceeded';
        setState(prev => ({ ...prev, isCreating: false, error: rateLimitError, success: false }));
        throw new Error(rateLimitError);
      }

      setState(prev => ({ ...prev, isCreating: true, error: null }));

      try {
        await createMarketContract(data.question, data.durationBlocks);

        setState(prev => ({
          ...prev,
          isCreating: false,
          success: true,
          error: null,
        }));
      } catch (error) {
        const contractError = parseContractError(error, MARKET_CONTRACT.name, 'create-market');
        const friendlyMessage = getUserFriendlyContractError(contractError);
        
        errorLoggingService.logError(contractError, {
          component: 'useMarketCreation',
          action: 'create-market',
          additionalData: {
            question: data.question,
            durationBlocks: data.durationBlocks,
          },
        });

        setState(prev => ({
          ...prev,
          isCreating: false,
          error: friendlyMessage,
          success: false,
        }));
        
        throw contractError;
      }
    },
    [createMarketContract, isContractPaused, checkRateLimit]
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
