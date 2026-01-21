import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/contract';
import { stxToMicroStx } from '../constants/markets';

interface StakeResult {
    isLoading: boolean;
    error: string | null;
    txId: string | null;
}

interface UseStakeReturn extends StakeResult {
    placeYesStake: (marketId: number, stakeAmount: number, onSuccess?: () => void) => Promise<void>;
    placeNoStake: (marketId: number, stakeAmount: number, onSuccess?: () => void) => Promise<void>;
    reset: () => void;
}

export function useStake(): UseStakeReturn {
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
            stakeAmount: number,
            functionName: 'place-yes-stake' | 'place-no-stake',
            onSuccess?: () => void
        ) => {
            setIsLoading(true);
            setError(null);
            setTxId(null);

            try {
                const stakeMicroStx = stxToMicroStx(stakeAmount);

                await openContractCall({
                    contractAddress: CONTRACT_ADDRESS,
                    contractName: CONTRACT_NAME,
                    functionName,
                    functionArgs: [uintCV(marketId), uintCV(stakeMicroStx)],
                    postConditionMode: PostConditionMode.Deny,
                    onFinish: (data) => {
                        console.log('Stake transaction submitted:', data.txId);
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
                console.error('Error placing stake:', err);
                setError(err instanceof Error ? err.message : 'Failed to place stake');
                setIsLoading(false);
            }
        },
        []
    );

    const placeYesStake = useCallback(
        async (marketId: number, stakeAmount: number, onSuccess?: () => void) => {
            await placeStake(marketId, stakeAmount, 'place-yes-stake', onSuccess);
        },
        [placeStake]
    );

    const placeNoStake = useCallback(
        async (marketId: number, stakeAmount: number, onSuccess?: () => void) => {
            await placeStake(marketId, stakeAmount, 'place-no-stake', onSuccess);
        },
        [placeStake]
    );

    return {
        placeYesStake,
        placeNoStake,
        isLoading,
        error,
        txId,
        reset,
    };
}
