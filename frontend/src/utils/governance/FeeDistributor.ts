/**
 * Utility for calculating and simulating protocol fee distributions across various stakeholders (DAO, dev, staking).
 */
export class FeeDistributor {
    /**
     * Calculates the split of a given amount based on percentage allocations.
     * @param totalAmount Total STX amount to distribute
     * @param allocations Map of stakeholder names to percentage shares (0.0 - 1.0)
     */
    static calculateSplit(totalAmount: number, allocations: Record<string, number>): Record<string, number> {
        const split: Record<string, number> = {};
        for (const [key, percentage] of Object.entries(allocations)) {
            split[key] = Number((totalAmount * percentage).toFixed(6));
        }
        return split;
    }

    /**
     * Retrieves the current protocol fee allocation manifest.
     */
    static currentProtocolAllocations(): Record<string, number> {
        return {
            DAOTreasury: 0.60,
            DeveloperFund: 0.20,
            StakingIncentives: 0.15,
            OracleBounty: 0.05
        };
    }

    /**
     * Estimates the annual revenue for the treasury based on daily volume.
     * @param dailyVolume Daily trading volume in STX
     * @param protocolFeePercent Fee percentage (e.g., 0.025 for 2.5%)
     */
    static estimateTreasuryRevenue(dailyVolume: number, protocolFeePercent: number): number {
        const dailyTax = dailyVolume * protocolFeePercent;
        const treasuryShare = dailyTax * this.currentProtocolAllocations().DAOTreasury;
        return Number((treasuryShare * 365).toFixed(2));
    }

    /**
     * Simulates the impact of a fee change on the incentive pool.
     */
    static simulateFeeImpact(volume: number, newFee: number): { before: number, after: number, diff: number } {
        const currentFee = 0.025;
        const currentTake = volume * currentFee * this.currentProtocolAllocations().StakingIncentives;
        const newTake = volume * newFee * this.currentProtocolAllocations().StakingIncentives;

        return {
            before: currentTake,
            after: newTake,
            diff: newTake - currentTake
        };
    }
}
