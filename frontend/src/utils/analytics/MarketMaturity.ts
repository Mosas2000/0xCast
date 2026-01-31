/**
 * Utility for assessing the maturity and stability of a market based on time and liquidity.
 */
export class MarketMaturity {
    /**
     * Calculates a maturity score (0-100).
     * @param ageInDays Days since market creation
     * @param totalStake Total amount staked in STX
     * @param participantCount Number of unique traders
     */
    static getMaturityScore(ageInDays: number, totalStake: number, participantCount: number): number {
        const ageWeight = 0.3;
        const stakeWeight = 0.4;
        const userWeight = 0.3;

        // Normalization (mocked thresholds)
        const normAge = Math.min(1, ageInDays / 30);
        const normStake = Math.min(1, totalStake / 50000);
        const normUsers = Math.min(1, participantCount / 500);

        const score = (normAge * ageWeight) + (normStake * stakeWeight) + (normUsers * userWeight);
        return Number((score * 100).toFixed(0));
    }

    /**
     * Categorizes the market stage.
     */
    static getMarketStage(score: number): 'INCUBATION' | 'DISCOVERY' | 'MATURE' | 'SATURATED' {
        if (score > 90) return 'SATURATED';
        if (score > 60) return 'MATURE';
        if (score > 30) return 'DISCOVERY';
        return 'INCUBATION';
    }

    /**
     * Determines if a market is safe for high-volume traders.
     */
    static isInstitutionalGrade(score: number, totalStake: number): boolean {
        // Institutional grade requires maturity and high liquidity
        return score > 75 && totalStake > 100000;
    }

    /**
     * Returns a risk assessment string.
     */
    static getRiskAssessment(stage: string): string {
        switch (stage) {
            case 'INCUBATION': return 'High Risk: Low liquidity and limited participation.';
            case 'DISCOVERY': return 'Moderate Risk: Price discovery in progress.';
            case 'MATURE': return 'Low Risk: Stable liquidity and diverse participation.';
            case 'SATURATED': return 'Safe: High stability, potentially lower volatility.';
            default: return 'Unknown Risk profile.';
        }
    }
}
