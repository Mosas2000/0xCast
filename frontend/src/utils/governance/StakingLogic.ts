/**
 * Utility for implementing decentralized staking logic, reward distributions, and early-withdrawal penalties.
 */
export class StakingLogic {
    /**
     * Calculates the reward amount for a given staking period.
     * @param amount Staked STX amount
     * @param apr Annual Percentage Rate (e.g., 0.08 for 8%)
     * @param days Staked duration in days
     */
    static calculateRewards(amount: number, apr: number, days: number): number {
        const dailyRate = apr / 365;
        return Number((amount * dailyRate * days).toFixed(6));
    }

    /**
     * Estimates the penalty for early withdrawal.
     * @param amount Staked amount
     * @param remainingDays Days left in the lock period
     */
    static calculateEarlyWithdrawalPenalty(amount: number, remainingDays: number): number {
        // Penalty is proportional to the remaining time, up to a maximum of 10% of principal.
        const penaltyRate = Math.min(0.1, (remainingDays / 365) * 0.1);
        return Number((amount * penaltyRate).toFixed(6));
    }

    /**
     * Determines the "Staking Tier" based on locked amount and duration.
     */
    static getStakingTier(amount: number, lockDays: number): 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' {
        const power = amount * (lockDays / 30);
        if (power > 500000) return 'DIAMOND';
        if (power > 100000) return 'PLATINUM';
        if (power > 25000) return 'GOLD';
        return 'SILVER';
    }

    /**
     * Calculates the effective APY considering compounding frequency.
     */
    static calculateAPY(apr: number, compoundingsPerYear: number = 12): number {
        const r = apr / compoundingsPerYear;
        const apy = Math.pow(1 + r, compoundingsPerYear) - 1;
        return Number((apy * 100).toFixed(2));
    }
}
