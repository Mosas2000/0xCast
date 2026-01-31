/**
 * Utility for analyzing risk profiles of markets and individual trading positions.
 */
export class RiskAnalyzer {
    /**
     * Calculates the standard deviation of prices to measure volatility.
     */
    static calculateVolatility(prices: number[]): number {
        if (prices.length < 2) return 0;
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
        return Number(Math.sqrt(variance).toFixed(4));
    }

    /**
     * Calculates the Value at Risk (VaR) for a position.
     * Simplified mock version of VaR at 95% confidence.
     */
    static calculateVaR(amount: number, volatility: number): number {
        // Basic approximation: 1.645 * volatility * amount
        return Number((1.645 * volatility * amount).toFixed(2));
    }

    /**
     * Assesses the risk level of a market.
     */
    static getRiskLevel(volatility: number, liquidity: number): 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' {
        if (volatility > 0.1) return 'CRITICAL';
        if (volatility > 0.05 || liquidity < 5000) return 'HIGH';
        if (volatility > 0.02 || liquidity < 20000) return 'MODERATE';
        return 'LOW';
    }

    /**
     * Returns a recommendation for position sizing based on risk.
     */
    static getPositionRecommendation(riskLevel: string): string {
        switch (riskLevel) {
            case 'CRITICAL': return 'Scalp only. Use minimum position size.';
            case 'HIGH': return 'High risk exposure. Consider tighter stop-loss.';
            case 'MODERATE': return 'Normal exposure. Diversify across outcomes.';
            case 'LOW': return 'Stable market. Potential for higher conviction stakes.';
            default: return 'Inconclusive data.';
        }
    }
}
