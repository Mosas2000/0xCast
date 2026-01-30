import { estimateGasFee, CONTRACT_CALL_FEE } from '../gasEstimation';

/**
 * Advanced gas estimation service for complex trading operations.
 */
export class GasEstimator {
    private static readonly MICROSTACKS_PER_STX = 1_000_000;

    /**
     * Estimates the cost of a multi-step trade sequence.
     * @param steps Number of contract calls involved
     * @param priority 'low' | 'standard' | 'high'
     */
    static estimateSequenceCost(steps: number = 1, priority: 'low' | 'standard' | 'high' = 'standard'): number {
        const baseFee = estimateGasFee('contract-call');
        const multipliers = {
            low: 0.8,
            standard: 1.0,
            high: 2.5
        };

        const totalMicroStx = steps * baseFee * multipliers[priority];
        return totalMicroStx / this.MICROSTACKS_PER_STX;
    }

    /**
     * Calculates the exact STX required for a stake including dynamic gas buffers.
     */
    static calculateTotalRequired(stakeAmount: number, networkCongestion: number = 1.0): number {
        const gasBufferStx = (CONTRACT_CALL_FEE * 1.2 * networkCongestion) / this.MICROSTACKS_PER_STX;
        return stakeAmount + gasBufferStx;
    }

    /**
     * Returns a human-readable tooltip for gas costs.
     */
    static getGasDescription(priority: 'low' | 'standard' | 'high'): string {
        const descriptions = {
            low: "Cheap but might take several blocks.",
            standard: "Reasonable cost, likely confirmed in next block.",
            high: "Top priority for immediate execution."
        };
        return descriptions[priority];
    }
}
