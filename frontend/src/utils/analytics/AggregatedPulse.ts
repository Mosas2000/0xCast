/**
 * Utility for aggregating global protocol metrics into a single "Pulse" score.
 */
export class AggregatedPulse {
    /**
     * Calculates the global protocol health score (Pulse).
     * @param totalVolume 24h volume in STX
     * @param activeUsers 24h active participants
     * @param marketSuccessRate Percentage of markets resolved correctly (0-1)
     * @param liquidityDepth Average pool depth
     */
    static calculateGlobalPulse(
        totalVolume: number,
        activeUsers: number,
        marketSuccessRate: number,
        liquidityDepth: number
    ): number {
        const volumeWeight = 0.3;
        const userWeight = 0.2;
        const successWeight = 0.4;
        const liquidityWeight = 0.1;

        // Normalizing values (mocked normalization factors)
        const normVolume = Math.min(1, totalVolume / 1000000);
        const normUsers = Math.min(1, activeUsers / 10000);
        const normLiquidity = Math.min(1, liquidityDepth / 50000);

        const pulse = (normVolume * volumeWeight) +
            (normUsers * userWeight) +
            (marketSuccessRate * successWeight) +
            (normLiquidity * liquidityWeight);

        return Number((pulse * 100).toFixed(1));
    }

    /**
     * Returns a status label based on the pulse score.
     */
    static getStatus(pulse: number): 'OPTIMAL' | 'STABLE' | 'VOLATILE' | 'DROOP' {
        if (pulse > 80) return 'OPTIMAL';
        if (pulse > 60) return 'STABLE';
        if (pulse > 40) return 'VOLATILE';
        return 'DROOP';
    }

    /**
     * Generates a recommendation for protocol governance based on pulse.
     */
    static getRecommendation(pulse: number): string {
        if (pulse < 40) return 'Emergency liquidity incentives recommended.';
        if (pulse < 60) return 'Monitor market resolution times and fees.';
        return 'Protocol health is strong. Proceed with planned upgrades.';
    }
}
