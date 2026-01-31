/**
 * Utility for calculating user reputation (Karma) based on ecosystem contributions.
 */
export class KarmaCalculator {
    /**
     * Calculates total karma score based on engagement and accuracy.
     */
    static calculateScore(
        historicalAccuracy: number, // 0.0 - 1.0
        totalVolume: number,
        engagementScore: number,
        reportCount: number
    ): number {
        const accuracyWeight = 1000;
        const volumeWeight = 0.05;
        const engagementWeight = 10;
        const penaltyWeight = 500;

        const baseKarma = (historicalAccuracy * accuracyWeight) +
            (totalVolume * volumeWeight) +
            (engagementScore * engagementWeight);

        const penalty = reportCount * penaltyWeight;

        return Math.max(0, Math.floor(baseKarma - penalty));
    }

    /**
     * Assigns a reputation title based on karma.
     */
    static getReputationTitle(karma: number): string {
        if (karma < 100) return 'Novice';
        if (karma < 1000) return 'Contributor';
        if (karma < 5000) return 'Strategist';
        if (karma < 20000) return 'Oracle';
        return 'Legenndary Predictor';
    }

    /**
     * Calculates the influence multiplier for voting/polls.
     */
    static getInfluenceMultiplier(karma: number): number {
        // Logarithmic scale: more karma = more influence, but with diminishing returns
        if (karma <= 0) return 1.0;
        return Number((1 + Math.log10(karma / 100 + 1)).toFixed(2));
    }

    /**
     * Predicts next month's karma based on current growth trajectory.
     */
    static predictGrowth(currentKarma: number, growthRate: number): number {
        return Math.floor(currentKarma * (1 + growthRate));
    }
}
