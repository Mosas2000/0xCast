import { useState, useEffect } from 'react';
import { Position } from '../types/market';
import { useUserPosition } from './useUserPosition';
import { useWallet } from './useWallet';
import { microStxToStx } from '../constants/markets';

interface UseUserPositionsResult {
    positions: Position[];
    isLoading: boolean;
    totalStaked: number; // in STX
    marketsCount: number;
}

/**
 * Hook to fetch all positions for the connected user across all markets
 * @param marketIds - Array of market IDs to check
 * @returns All user positions, loading state, total staked, and markets count
 */
export function useUserPositions(marketIds: number[]): UseUserPositionsResult {
    const { userAddress } = useWallet();
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userAddress || marketIds.length === 0) {
            setPositions([]);
            setIsLoading(false);
            return;
        }

        // This is a simplified version - in production, you'd want to batch these calls
        // or use a more efficient method to fetch all positions at once
        const fetchAllPositions = async () => {
            setIsLoading(true);

            // For now, we'll just set empty array
            // TODO: Implement actual position fetching for all markets
            setPositions([]);
            setIsLoading(false);
        };

        fetchAllPositions();
    }, [userAddress, marketIds]);

    // Calculate total staked across all positions
    const totalStaked = positions.reduce((sum, position) => {
        const yesStx = microStxToStx(position.yesStake);
        const noStx = microStxToStx(position.noStake);
        return sum + yesStx + noStx;
    }, 0);

    // Count markets with positions
    const marketsCount = positions.length;

    return {
        positions,
        isLoading,
        totalStaked,
        marketsCount,
    };
}
