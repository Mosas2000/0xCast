/**
 * Utility for detecting price discrepancies and arbitrage opportunities across markets.
 */
export class ArbitrageTool {
    /**
     * Identifies if two related markets have a price gap that allows for risk-free profit.
     * @param priceA Odds of Event X on Market A (0-100)
     * @param priceB Odds of Event X on Market B (0-100)
     * @param fee Protocol fee percentage per trade (e.g., 0.02)
     */
    static findDiscrepancy(priceA: number, priceB: number, fee: number = 0.02): number {
        const gap = Math.abs(priceA - priceB);
        const costOfEntry = (priceA * fee) + (priceB * fee);

        return gap > costOfEntry ? gap - costOfEntry : 0;
    }

    /**
     * Calculates potential ROIs for an arbitrage trade between two venues.
     */
    static estimateProfit(amount: number, gap: number): number {
        return amount * (gap / 100);
    }

    /**
     * Checks if a set of outcomes in a multi-choice market violates the 100% sum rule.
     * (Standard arbitrage detection for complementary outcomes)
     */
    static checkSumRule(prices: number[]): { total: number, deviation: number } {
        const total = prices.reduce((a, b) => a + b, 0);
        return {
            total,
            deviation: total - 100
        };
    }
}
