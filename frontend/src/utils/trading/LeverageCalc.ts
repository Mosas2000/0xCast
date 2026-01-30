/**
 * Utility for calculating theoretical leverage and risk multipliers for prediction positions.
 */
export class LeverageCalc {
    /**
     * Calculates the multiplier effect of a position relative to the initial stake.
     * @param stake Initial STX amount
     * @param poolSize Current pool size for the outcome
     * @param totalLiquidity Total market liquidity
     */
    static calculateEffectiveLeverage(stake: number, poolSize: number, totalLiquidity: number): number {
        if (totalLiquidity === 0 || poolSize === 0) return 1.0;

        // Leverage in prediction markets is implied by the odds.
        // Low probability outcomes act like high leverage.
        const probability = poolSize / totalLiquidity;
        const impliedLeverage = 1 / probability;

        return Number(impliedLeverage.toFixed(2));
    }

    /**
     * Estimates the liquidation price equivalent (odds at which stake is worth nearly zero).
     */
    static estimateLiquidationOdds(targetLeverage: number): number {
        return (1 / targetLeverage) * 100;
    }

    /**
     * Calculates risk-adjusted position size based on leverage.
     */
    static suggestPositionSize(balance: number, leverage: number, riskTolerance: number = 0.05): number {
        // Basic risk management: Never risk more than X% adjusted for implied leverage
        return (balance * riskTolerance) / (1 + (leverage / 10));
    }

    /**
     * Returns a risk rating for a specific leverage level.
     */
    static getRiskRating(leverage: number): 'safe' | 'moderate' | 'aggressive' | 'degen' {
        if (leverage < 2) return 'safe';
        if (leverage < 5) return 'moderate';
        if (leverage < 10) return 'aggressive';
        return 'degen';
    }
}
