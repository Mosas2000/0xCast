import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/contract';
import { MarketOutcome } from '../types/market';

interface ResolveResult {
    isLoading: boolean;
    error: string | null;
    txId: string | null;
}

interface UseResolveReturn extends ResolveResult {
    resolve: (marketId: number, outcome: MarketOutcome, onSuccess?: () => void) => Promise<void>;
    reset: () => void;
}

/**
 * Hook for resolving markets (creator only)
 * @returns Resolve function, loading state, error, and transaction ID
 */
export function useResolve(): UseResolveReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txId, setTxId] = useState<string | null>(null);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setTxId(null);
    }, []);

    const resolve = useCallback(async (
        marketId: number,
        outcome: MarketOutcome,
        onSuccess?: () => void
    ) => {
        if (outcome === MarketOutcome.NONE) {
            setError('Please select a valid outcome (YES or NO)');
            return;
        }

        setIsLoading(true);
        setError(null);
        setTxId(null);

        try {
            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'resolve-market',
                functionArgs: [uintCV(marketId), uintCV(outcome)],
                postConditionMode: PostConditionMode.Deny,
                onFinish: (data) => {
                    console.log('Resolution transaction submitted:', data.txId);
                    setTxId(data.txId);
                    setIsLoading(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onCancel: () => {
                    setError('Transaction cancelled');
                    setIsLoading(false);
                },
            });
        } catch (err) {
            console.error('Error resolving market:', err);
            setError(err instanceof Error ? err.message : 'Failed to resolve market');
            setIsLoading(false);
        }
    }, []);

    return {
        resolve,
        isLoading,
        error,
        txId,
        reset,
    };
}
