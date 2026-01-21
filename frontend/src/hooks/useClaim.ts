import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/contract';

interface ClaimResult {
    isLoading: boolean;
    error: string | null;
    txId: string | null;
}

interface UseClaimReturn extends ClaimResult {
    claim: (marketId: number, onSuccess?: () => void) => Promise<void>;
    reset: () => void;
}

/**
 * Hook for claiming winnings from a resolved market
 * @returns Claim function, loading state, error, and transaction ID
 */
export function useClaim(): UseClaimReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txId, setTxId] = useState<string | null>(null);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setTxId(null);
    }, []);

    const claim = useCallback(async (marketId: number, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        setTxId(null);

        try {
            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'claim-winnings',
                functionArgs: [uintCV(marketId)],
                postConditionMode: PostConditionMode.Deny,
                onFinish: (data) => {
                    console.log('Claim transaction submitted:', data.txId);
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
            console.error('Error claiming winnings:', err);
            setError(err instanceof Error ? err.message : 'Failed to claim winnings');
            setIsLoading(false);
        }
    }, []);

    return {
        claim,
        isLoading,
        error,
        txId,
        reset,
    };
}
