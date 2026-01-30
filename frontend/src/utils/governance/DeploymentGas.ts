/**
 * Utility for estimating and optimizing gas costs for protocol deployments and smart contract interactions on Stacks.
 */
export class DeploymentGas {
    private static BASE_DEPLOY_GAS = 0.5; // Base STX for contract deployment
    private static PER_BYTE_GAS = 0.00001; // STX per byte of contract code

    /**
     * Estimates the total gas required for a contract deployment.
     * @param codeLength Length of the contract source code in bytes
     */
    static estimateDeploymentGas(codeLength: number): number {
        return Number((this.BASE_DEPLOY_GAS + (codeLength * this.PER_BYTE_GAS)).toFixed(6));
    }

    /**
     * Calculates "Gas Savings" from optimization techniques (e.g., code minification).
     */
    static estimateSavings(originalLength: number, optimizedLength: number): { saved: number, percent: number } {
        const originalGas = this.estimateDeploymentGas(originalLength);
        const optimizedGas = this.estimateDeploymentGas(optimizedLength);
        const saved = originalGas - optimizedGas;

        return {
            saved: Number(saved.toFixed(6)),
            percent: Number(((saved / originalGas) * 100).toFixed(2))
        };
    }

    /**
     * Returns a recommendation for gas priority based on network congestion.
     * @param congestionScore 0.0 to 1.0 (1.0 = highly congested)
     */
    static getGasPriority(congestionScore: number): 'LOW' | 'STANDARD' | 'FAST' | 'INSTANT' {
        if (congestionScore > 0.8) return 'INSTANT';
        if (congestionScore > 0.5) return 'FAST';
        if (congestionScore > 0.2) return 'STANDARD';
        return 'LOW';
    }

    /**
     * Generates a verbal cost-benefit summary for a proposed deployment.
     */
    static getCostSummary(estGas: number): string {
        return `Estimated deployment cost: ${estGas} STX. Recommended priority: FAST to ensure inclusion in the next Bitcoin anchor block.`;
    }
}
