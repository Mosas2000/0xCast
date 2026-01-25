import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, uintCV, principalCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import type { Position } from '../types/market';
import { parsePosition } from '../utils/contractHelpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/contract';

interface UseUserPositionResult {
    position: Position | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch a user's position in a specific market
 * @param marketId - The ID of the market
 * @param userAddress - The user's Stacks address
 * @returns User's position data, loading state, error, and refetch function
 */
export function useUserPosition(marketId: number, userAddress: string | null): UseUserPositionResult {
    const [position, setPosition] = useState<Position | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosition = useCallback(async () => {
        if (!userAddress || marketId < 0) {
            setPosition(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchCallReadOnlyFunction({
                network: STACKS_MAINNET,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-user-position',
                functionArgs: [uintCV(marketId), principalCV(userAddress)],
                senderAddress: CONTRACT_ADDRESS,
            });

            // Convert Clarity value to JSON
            const jsonResult = cvToJSON(result);

            // Check if position exists (should be a Some value)
            if (jsonResult.type === 'none') {
                // No position for this user in this market
                setPosition(null);
                setIsLoading(false);
                return;
            }

            // Parse the position data
            if (jsonResult.type === 'some' && jsonResult.value) {
                const positionData = parsePosition(marketId, userAddress, jsonResult.value);
                setPosition(positionData);
                setError(null);
            } else {
                setPosition(null);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching user position:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch position');
            setPosition(null);
            setIsLoading(false);
        }
    }, [marketId, userAddress]);

    useEffect(() => {
        fetchPosition();
    }, [fetchPosition]);

    return {
        position,
        isLoading,
        error,
        refetch: fetchPosition,
    };
}
