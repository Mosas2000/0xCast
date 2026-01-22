/**
 * Gas fee estimation utilities for Stacks transactions
 */

// Typical transaction fees on Stacks (in microSTX)
export const STX_TRANSFER_FEE = 180; // ~0.000180 STX
export const CONTRACT_CALL_FEE = 500_000; // ~0.5 STX (conservative estimate)

/**
 * Estimate gas fee for a transaction
 * @param type - Type of transaction ('transfer' or 'contract-call')
 * @returns Estimated fee in microSTX
 */
export function estimateGasFee(type: 'transfer' | 'contract-call' = 'contract-call'): number {
    return type === 'transfer' ? STX_TRANSFER_FEE : CONTRACT_CALL_FEE;
}

/**
 * Calculate total cost including stake and gas fee
 * @param stakeAmount - Stake amount in STX
 * @param gasFee - Gas fee in microSTX (optional, defaults to CONTRACT_CALL_FEE)
 * @returns Total cost in microSTX
 */
export function calculateTotalCost(stakeAmount: number, gasFee: number = CONTRACT_CALL_FEE): number {
    const stakeInMicroSTX = Math.floor(stakeAmount * 1_000_000);
    return stakeInMicroSTX + gasFee;
}

/**
 * Format microSTX to STX for display
 * @param microSTX - Amount in microSTX
 * @returns Formatted string in STX
 */
export function formatSTX(microSTX: number): string {
    return (microSTX / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    });
}

/**
 * Check if wallet has sufficient balance for transaction
 * @param walletBalance - Wallet balance in microSTX
 * @param requiredAmount - Required amount in microSTX
 * @param buffer - Optional safety buffer in microSTX (default: 0.1 STX)
 * @returns True if balance is sufficient
 */
export function hasSufficientBalance(
    walletBalance: number,
    requiredAmount: number,
    buffer: number = 100_000
): boolean {
    return walletBalance >= requiredAmount + buffer;
}
