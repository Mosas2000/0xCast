/**
 * Utility for calculating potential price impact and slippage for large trades.
 */
export class PriceImpact {
    /**
     * Calculates the percentage change in price based on trade volume and current liquidity.
     * Basic formula: (New Price - Old Price) / Old Price
     * @param volume The amount of STX to stake
     * @param totalPool The current pool size for that outcome
     * @param priceSensitivity Constant representing market depth factor (default: 0.1)
     */
    static calculate(volume: number, totalPool: number, priceSensitivity: number = 0.1): number {
        if (totalPool === 0) return 0;

        // Simplified model: impact grows with volume relative to pool
        const impact = (volume / totalPool) * priceSensitivity * 100;

        return Number(impact.toFixed(4));
    }

    /**
     * Returns a warning level based on the impact percentage.
     */
    static getWarningLevel(impact: number): 'low' | 'medium' | 'high' {
        if (impact < 1) return 'low';
        if (impact < 5) return 'medium';
        return 'high';
    }

    /**
     * Suggests an optimal volume to stay under a 1% slippage threshold.
     */
    static suggestMaxVolume(totalPool: number, priceSensitivity: number = 0.1): number {
        return (0.01 / priceSensitivity) * totalPool;
    }
}
