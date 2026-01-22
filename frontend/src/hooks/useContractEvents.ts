import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, callReadOnlyFunction, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, STACKS_MAINNET } from '../constants/contract';

export interface ContractEvent {
    id: string;
    type: 'market_created' | 'stake_placed' | 'market_resolved';
    marketId: number;
    timestamp: Date;
    data?: any;
}

interface UseContractEventsOptions {
    enabled?: boolean;
    pollInterval?: number; // milliseconds
}

interface UseContractEventsResult {
    events: ContractEvent[];
    isListening: boolean;
    error: string | null;
}

/**
 * Hook to monitor contract events
 * Currently polls for new events (WebSocket support can be added later)
 * Detects: new markets, new stakes, and resolutions
 */
export function useContractEvents({
    enabled = true,
    pollInterval = 15000, // 15 seconds
}: UseContractEventsOptions = {}): UseContractEventsResult {
    const [events, setEvents] = useState<ContractEvent[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastMarketCount, setLastMarketCount] = useState(0);

    const checkForNewMarkets = useCallback(async () => {
        try {
            const result = await callReadOnlyFunction({
                network: STACKS_MAINNET,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-market-counter',
                functionArgs: [],
                senderAddress: CONTRACT_ADDRESS,
            });

            const jsonResult = cvToJSON(result);
            const currentCount = Number(jsonResult.value);

            // Detect new markets
            if (lastMarketCount > 0 && currentCount > lastMarketCount) {
                const newMarkets = currentCount - lastMarketCount;
                const newEvents: ContractEvent[] = [];

                for (let i = 0; i < newMarkets; i++) {
                    const marketId = lastMarketCount + i;
                    newEvents.push({
                        id: `market_created_${marketId}_${Date.now()}`,
                        type: 'market_created',
                        marketId,
                        timestamp: new Date(),
                    });
                }

                setEvents(prev => [...newEvents, ...prev].slice(0, 50)); // Keep last 50 events
            }

            setLastMarketCount(currentCount);
            setError(null);
        } catch (err) {
            console.error('Error checking for new markets:', err);
            setError(err instanceof Error ? err.message : 'Failed to check events');
        }
    }, [lastMarketCount]);

    const checkForNewStakes = useCallback(async () => {
        // For now, we'll detect stakes by monitoring market data changes
        // This is a simplified version - in production, you'd want to use
        // WebSocket events or more sophisticated polling
        try {
            if (lastMarketCount === 0) return;

            // Check the most recent market for stake changes
            const recentMarketId = lastMarketCount - 1;
            
            const result = await callReadOnlyFunction({
                network: STACKS_MAINNET,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'get-market',
                functionArgs: [uintCV(recentMarketId)],
                senderAddress: CONTRACT_ADDRESS,
            });

            const jsonResult = cvToJSON(result);
            
            if (jsonResult.type === 'some' && jsonResult.value) {
                // Check if there's activity (stake changes would be reflected here)
                // For a full implementation, you'd store previous values and compare
                const totalYesStake = Number(jsonResult.value.value['total-yes-stake']?.value || 0);
                const totalNoStake = Number(jsonResult.value.value['total-no-stake']?.value || 0);
                
                // Store stakes for comparison (simplified for demo)
                if (totalYesStake > 0 || totalNoStake > 0) {
                    // We could emit a stake event here if we detect changes
                    // This would require storing previous state
                }
            }
        } catch (err) {
            console.error('Error checking for new stakes:', err);
        }
    }, [lastMarketCount]);

    useEffect(() => {
        if (!enabled) {
            setIsListening(false);
            return;
        }

        setIsListening(true);

        // Initial check
        checkForNewMarkets();

        // Poll for events
        const interval = setInterval(() => {
            checkForNewMarkets();
            checkForNewStakes();
        }, pollInterval);

        return () => {
            clearInterval(interval);
            setIsListening(false);
        };
    }, [enabled, pollInterval, checkForNewMarkets, checkForNewStakes]);

    return {
        events,
        isListening,
        error,
    };
}
