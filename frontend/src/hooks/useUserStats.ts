import { useMemo } from 'react';
import type { Position, Market } from '../types/market';
import { MarketStatus } from '../types/market';
import { microStxToStx } from '../constants/markets';
import { isWinningPosition, calculateClaimableAmount } from '../utils/positionCalculations';

interface UserStatsResult {
    totalStaked: number;
    winRate: number;
    marketCount: number;
    roi: number;
    totalWinnings: number;
    activePositions: number;
}

/**
 * Hook to calculate user statistics
 * @param userAddress - User's wallet address
 * @param positions - User's positions
 * @param markets - All markets
 * @returns Aggregated user statistics
 */
export function useUserStats(userAddress: string, positions: Position[], markets: Market[]): UserStatsResult {
    return useMemo(() => {
        // Total staked
        const totalStaked = positions.reduce((sum, pos) => sum + pos.yesStake + pos.noStake, 0);

        // Win rate calculation
        const resolvedPositions = positions.filter(pos => {
            const market = markets.find(m => m.id === pos.marketId);
            return market && market.status === MarketStatus.RESOLVED;
        });
        const wonPositions = resolvedPositions.filter(pos => {
            const market = markets.find(m => m.id === pos.marketId);
            return market && isWinningPosition(pos, market);
        });
        const winRate = resolvedPositions.length > 0 ? (wonPositions.length / resolvedPositions.length) * 100 : 0;

        // Market count (created by user)
        const marketCount = markets.filter(m => m.creator === userAddress).length;

        // Total winnings
        const totalWinnings = positions.reduce((sum, pos) => {
            const market = markets.find(m => m.id === pos.marketId);
            if (!market) return sum;
            return sum + calculateClaimableAmount(pos, market);
        }, 0);

        // ROI calculation
        const roi = totalStaked > 0 ? ((totalWinnings - totalStaked) / totalStaked) * 100 : 0;

        // Active positions count
        const activePositions = positions.filter(pos => {
            const market = markets.find(m => m.id === pos.marketId);
            return market && market.status === MarketStatus.ACTIVE;
        }).length;

        return {
            totalStaked: microStxToStx(totalStaked),
            winRate,
            marketCount,
            roi,
            totalWinnings: microStxToStx(totalWinnings),
            activePositions,
        };
    }, [userAddress, positions, markets]);
}
