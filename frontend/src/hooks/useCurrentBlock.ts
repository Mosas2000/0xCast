import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

interface BlockHeightData {
    blockHeight: number;
    isLoading: boolean;
    error: string | null;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

interface StacksInfoResponse {
    stacks_tip_height: number;
    stacks_tip: string;
    server_version: string;
    network_id: number;
}

/**
 * Hook to fetch and track current Stacks block height
 * Updates every 30 seconds
 * @returns Current block height, loading state, and error
 */
export function useCurrentBlock(): BlockHeightData {
    const [blockHeight, setBlockHeight] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout;

        const fetchBlockHeight = async () => {
            try {
                const response = await fetch(API_INFO_URL);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();

                if (isMounted) {
                    setBlockHeight(data.stacks_tip_height);
                    setError(null);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error fetching block height:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch block height');
                    setIsLoading(false);
                }
            }
        };

        // Fetch immediately
        fetchBlockHeight();

        // Set up interval to fetch every 30 seconds
        intervalId = setInterval(fetchBlockHeight, REFRESH_INTERVAL);

        // Cleanup
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return { blockHeight, isLoading, error };
}
