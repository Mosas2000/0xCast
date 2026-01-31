/**
 * Utility for basic capital gains tax estimation based on trading PnL.
 */
export class TaxEstimator {
    /**
     * Estimates the tax liability for a given profit.
     * @param profitNet Total net profit in STX
     * @param taxRate Percentage rate (e.g., 0.15 for 15%)
     */
    static estimateLiability(profitNet: number, taxRate: number = 0.15): number {
        return Math.max(0, profitNet * taxRate);
    }

    /**
     * Calculates the "Wash Sale" risk (simplified).
     * @param lostAmount Amount lost in the last 30 days
     * @param gainedAmount Amount gained in the same period
     */
    static getWashSaleWarning(lostAmount: number, gainedAmount: number): boolean {
        // Highly simplified: if losses are occurring in similar timeframes
        return lostAmount > 0 && gainedAmount > 0;
    }

    /**
     * Categorizes profit into Short-term vs Long-term based on duration.
     * @param durationDays Number of days position was held
     */
    static getCategory(durationDays: number): 'Short-term' | 'Long-term' {
        return durationDays > 365 ? 'Long-term' : 'Short-term';
    }

    /**
     * Returns a recommendation for tax-loss harvesting.
     */
    static suggestHarvesting(currentPnL: number): string {
        if (currentPnL < -100) {
            return "Consider harvesting these losses to offset future gains.";
        }
        return "No urgent tax actions recommended.";
    }
}
