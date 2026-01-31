/**
 * Utility for calculating decentralized voting power based on various protocol-specific factors (staking, activity, achievements).
 */
export class VotingWeight {
    /**
     * Calculates the raw voting power based on staked STX and duration.
     * @param stakedAmount Amount of STX locked in the treasury
     * @param lockDurationDays Number of days the STX is locked for
     */
    static calculateRawWeight(stakedAmount: number, lockDurationDays: number): number {
        // Basic duration multiplier: Power increases with commitment time.
        const durationMultiplier = 1 + (lockDurationDays / 365);
        return Number((stakedAmount * durationMultiplier).toFixed(2));
    }

    /**
     * Applies "Activity Multipliers" to reward active protocol contributors.
     * @param baseWeight Previously calculated raw weight
     * @param tradeCount Total number of trades in the last 30 days
     * @param successfulResolutions Number of correctly predicted resolutions
     */
    static applyActivityBonus(baseWeight: number, tradeCount: number, successfulResolutions: number): number {
        const activityBonus = Math.min(0.2, (tradeCount * 0.005)); // Max 20% bonus for participation
        const accuracyBonus = Math.min(0.3, (successfulResolutions * 0.02)); // Max 30% bonus for accuracy

        return Number((baseWeight * (1 + activityBonus + accuracyBonus)).toFixed(2));
    }

    /**
     * Calculates "vStacks" (Voting Stacks) - the final governance power.
     */
    static calculateVStacks(staked: number, duration: number, trades: number, success: number): number {
        const raw = this.calculateRawWeight(staked, duration);
        return this.applyActivityBonus(raw, trades, success);
    }

    /**
     * Returns the percentage of total protocol voting power representing by a user.
     */
    static getProtocolInfluence(userVStacks: number, globalVStacks: number): number {
        if (globalVStacks === 0) return 0;
        return Number(((userVStacks / globalVStacks) * 100).toFixed(4));
    }
}
