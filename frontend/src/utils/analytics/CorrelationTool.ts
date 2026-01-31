/**
 * Utility for analyzing correlations between different markets or external assets (e.g., STX price).
 */
export class CorrelationTool {
    /**
     * Calculates the Pearson Correlation Coefficient between two datasets.
     * Returns a value between -1 and 1.
     */
    static calculatePearson(setA: number[], setB: number[]): number {
        if (setA.length !== setB.length || setA.length === 0) return 0;

        const n = setA.length;
        let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;

        for (let i = 0; i < n; i++) {
            sumA += setA[i];
            sumB += setB[i];
            sumAB += setA[i] * setB[i];
            sumA2 += setA[i] * setA[i];
            sumB2 += setB[i] * setB[i];
        }

        const numerator = (n * sumAB) - (sumA * sumB);
        const denominator = Math.sqrt(((n * sumA2) - (sumA * sumA)) * ((n * sumB2) - (sumB * sumB)));

        if (denominator === 0) return 0;
        return Number((numerator / denominator).toFixed(4));
    }

    /**
     * Categorizes the strength of the correlation.
     */
    static getCorrelationStrength(coefficient: number): string {
        const absVal = Math.abs(coefficient);
        const direction = coefficient >= 0 ? 'Positive' : 'Negative';

        if (absVal > 0.8) return `Strong ${direction} Correlation`;
        if (absVal > 0.5) return `Moderate ${direction} Correlation`;
        if (absVal > 0.3) return `Weak ${direction} Correlation`;
        return 'No Significant Correlation';
    }

    /**
     * Identifies potential hedging opportunities based on negative correlation.
     */
    static findHedgeOpportunity(coefficient: number): boolean {
        // If markets are strongly inversely correlated, one can hedge the other.
        return coefficient < -0.6;
    }
}
