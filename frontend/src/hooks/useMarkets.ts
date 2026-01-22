import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, callReadOnlyFunction, uintCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { Market } from '../types/market';
import { parseMarketData } from '../utils/contractHelpers';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/contract';
import { useAutoRefresh } from './useAutoRefresh';

export function useMarkets() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMarkets = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // First, get the market counter to know how many markets exist
            const counterResult = await callReadOnlyFunction({
                network: STACKS_MAINNET,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-market-counter',
                functionArgs: [],
                senderAddress: CONTRACT_ADDRESS,
            });

            const counterJson = cvToJSON(counterResult);
            const totalMarkets = Number(counterJson.value);

            if (totalMarkets === 0) {
                setMarkets([]);
                setIsLoading(false);
                return;
            }

            // Fetch all markets
            const marketPromises = [];
            for (let i = 0; i < totalMarkets; i++) {
                marketPromises.push(
                    callReadOnlyFunction({
                        network: STACKS_MAINNET,
                        contractAddress: CONTRACT_ADDRESS,
                        contractName: CONTRACT_NAME,
                        functionName: 'get-market',
                        functionArgs: [uintCV(i)],
                        senderAddress: CONTRACT_ADDRESS,
                    })
                );
            }

            const results = await Promise.all(marketPromises);
            
            // Parse all markets
            const fetchedMarkets: Market[] = [];
            results.forEach((result, index) => {
                const jsonResult = cvToJSON(result);
                if (jsonResult.type === 'some' && jsonResult.value) {
                    try {
                        const marketData = parseMarketData(index, jsonResult.value);
                        fetchedMarkets.push(marketData);
                    } catch (err) {
                        console.error(`Error parsing market ${index}:`, err);
                    }
                }
            });

            setMarkets(fetchedMarkets);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching markets:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch markets');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    // Auto-refresh every 30 seconds, pausing when tab is inactive
    const { isRefreshing, lastRefresh, forceRefresh } = useAutoRefresh({
        interval: 30000, // 30 seconds
        enabled: true,
        onRefresh: fetchMarkets,
    });

    return {
        markets,
        isLoading: isLoading || isRefreshing,
        error,
        refetch: fetchMarkets,
        forceRefresh,
        lastRefresh,
        isRefreshing,
    };
}
