/**
 * Utility for automated reward reinvestment logic in prediction markets.
 */
export class AutoCompounder {
    /**
     * Calculates the potential yield increase if winnings are automatically reinvested.
     * Compounding formula: P * (1 + r/n)^(nt)
     * @param principal Initial stake amount
     * @param winRate Theoretical win rate (0-1)
     * @param roi Average return on investment per win (e.g., 0.8 for 80% ROI)
     * @param rounds Number of market cycles
     */
    static estimateCompoundReturn(
        principal: number,
        winRate: number,
        roi: number,
        rounds: number
    ): number {
        let balance = principal;

        for (let i = 0; i < rounds; i++) {
            if (Math.random() < winRate) {
                // Reinvesting win
                balance += (balance * roi);
            } else {
                // Lost this round
                balance = 0;
                break; // In a real model, you wouldn't bet everything or would have stop-losses
            }
        }

        return Number(balance.toFixed(2));
    }

    /**
     * Suggests the optimal reinvestment percentage to maximize growth vs risk.
     */
    static getOptimalReinvestmentRate(winRate: number, roi: number): number {
        // Kelly Criterion simplified: f* = (p*b - q) / b
        // where p = winRate, b = roi, q = 1 - winRate
        const p = winRate;
        const b = roi;
        const q = 1 - p;

        const f = (p * b - q) / b;
        return Math.max(0, Math.min(1, f)); // Clamp between 0% and 100%
    }
}
