import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, callReadOnlyFunction, uintCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { Market } from '../types/market';
import { parseMarketData } from '../utils/contractHelpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME, STACKS_API_URL } from '../constants/contract';

interface UseMarketResult {
    market: Market | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch a single market's data from the contract
 * @param marketId - The ID of the market to fetch
 * @returns Market data, loading state, error, and refetch function
 */
export function useMarket(marketId: number): UseMarketResult {
    const [market, setMarket] = useState<Market | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMarket = useCallback(async () => {
        if (marketId < 0) {
            setError('Invalid market ID');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await callReadOnlyFunction({
                network: STACKS_MAINNET,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-market',
                functionArgs: [uintCV(marketId)],
                senderAddress: CONTRACT_ADDRESS,
            });

            // Convert Clarity value to JSON
            const jsonResult = cvToJSON(result);

            // Check if market exists (should be a Some value)
            if (jsonResult.type === 'none') {
                setError('Market not found');
                setMarket(null);
                setIsLoading(false);
                return;
            }

            // Parse the market data
            if (jsonResult.type === 'some' && jsonResult.value) {
                const marketData = parseMarketData(marketId, jsonResult.value);
                setMarket(marketData);
                setError(null);
            } else {
                setError('Invalid market data format');
                setMarket(null);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching market:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch market');
            setMarket(null);
            setIsLoading(false);
        }
    }, [marketId]);

    useEffect(() => {
        fetchMarket();
    }, [fetchMarket]);

    return {
        market,
        isLoading,
        error,
        refetch: fetchMarket,
    };
}
