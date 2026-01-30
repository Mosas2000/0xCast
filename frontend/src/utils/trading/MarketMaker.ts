/**
 * Utility for simulating algorithmic liquidity provision (Market Making).
 */
export class MarketMaker {
    /**
     * Calculates the ideal stake to balance a market's odds to a target consensus.
     * @param currentYes Total STX in YES pool
     * @param currentNo Total STX in NO pool
     * @param targetOdds Target probability (0.0 - 1.0)
     */
    static getRebalanceAmount(currentYes: number, currentNo: number, targetOdds: number): { outcome: 'YES' | 'NO', amount: number } {
        const total = currentYes + currentNo;
        const currentOdds = currentYes / total;

        if (Math.abs(currentOdds - targetOdds) < 0.01) {
            return { outcome: 'YES', amount: 0 };
        }

        if (currentOdds < targetOdds) {
            // Need more YES
            const requiredYes = targetOdds * total;
            return { outcome: 'YES', amount: Math.max(0, requiredYes - currentYes) };
        } else {
            // Need more NO
            const targetNoOdds = 1 - targetOdds;
            const requiredNo = targetNoOdds * total;
            return { outcome: 'NO', amount: Math.max(0, requiredNo - currentNo) };
        }
    }

    /**
     * Estimates the "Market Making Yield" based on trade frequency (simulated).
     */
    static estimateMMYield(volume24h: number, protocolFee: number = 0.02): number {
        // MM's earn from the spread or protocol incentives
        return volume24h * protocolFee * 0.5; // Assuming 50% capture
    }

    /**
     * Suggests a spread strategy (Basic vs Aggressive).
     */
    static getStrategy(volatility: number): 'fixed' | 'dynamic' | 'aggressive' {
        if (volatility < 0.05) return 'fixed';
        if (volatility < 0.15) return 'dynamic';
        return 'aggressive';
    }
}
