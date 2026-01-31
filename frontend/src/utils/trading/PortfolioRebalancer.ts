/**
 * Utility for analyzing and suggesting adjustments to a trading portfolio.
 */
export interface Position {
    marketId: string;
    value: number;
    weight: number;
}

export class PortfolioRebalancer {
    /**
     * Suggests changes to reach a target allocation across different sectors.
     * @param positions Current list of positions
     * @param targetWeights Map of marketId to desired percentage (0.0-1.0)
     */
    static getAdjustmentPlan(
        positions: Position[],
        targetWeights: Record<string, number>
    ): { marketId: string, adjustment: number }[] {
        const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

        return positions.map((p) => {
            const targetWeight = targetWeights[p.marketId] || 0;
            const targetValue = totalValue * targetWeight;
            return {
                marketId: p.marketId,
                adjustment: targetValue - p.value
            };
        });
    }

    /**
     * Calculates the current diversification score (HHI index).
     */
    static getDiversificationScore(positions: Position[]): number {
        const total = positions.reduce((sum, p) => sum + p.value, 0);
        if (total === 0) return 0;

        // Herfindahl-Hirschman Index: sum of squares of weights
        const hhi = positions.reduce((sum, p) => sum + Math.pow(p.value / total, 2), 0);

        // Convert to a 0-100 scale where 100 is perfectly diversified (for N positions)
        return Number((1 - hhi).toFixed(4)) * 100;
    }
}
