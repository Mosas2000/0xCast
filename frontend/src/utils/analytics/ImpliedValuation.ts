/**
 * Utility for calculating the implied market valuation (Total Value Locked * Confidence) of markets.
 */
export class ImpliedValuation {
    /**
     * Calculates the Implied Protocol Value (IPV) for a single market.
     * @param totalStake Total STX staked
     * @param outcomeSkew Skew towards the lead outcome (0.5-1.0)
     */
    static calculateIPV(totalStake: number, outcomeSkew: number): number {
        // Valuation increases as consensus (skew) tightens for a high-stake market.
        const confidenceMultiplier = 1 + (outcomeSkew - 0.5) * 2;
        return Number((totalStake * confidenceMultiplier).toFixed(2));
    }

    /**
     * Aggregates the implied valuation across multiple markets.
     */
    static aggregateValuation(marketData: { stake: number, skew: number }[]): number {
        return marketData.reduce((total, m) => total + this.calculateIPV(m.stake, m.skew), 0);
    }

    /**
     * Estimates "Under/Overvalued" status based on volume to stake ratio.
     */
    static getValuationStatus(totalStake: number, totalVolume: number): 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' {
        const ratio = totalVolume / totalStake;
        if (ratio > 5) return 'UNDERVALUED'; // High interest relative to locked stake
        if (ratio < 0.5) return 'OVERVALUED'; // High stake with little actual trading interest
        return 'FAIR';
    }

    /**
     * Returns a verbal summary of the protocol's implied economic strength.
     */
    static getValuationSummary(totalIPV: number): string {
        return `The protocol's current Implied Economic Value is ${totalIPV.toLocaleString()} STX, reflecting high collective confidence in current resolutions.`;
    }
}
