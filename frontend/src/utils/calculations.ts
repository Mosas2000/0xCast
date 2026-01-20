import { MarketOutcome } from '../types/market';

/**
 * Calculate potential winnings for a stake
 * @param stake - User's stake amount in microSTX
 * @param totalYes - Total YES stakes in microSTX
 * @param totalNo - Total NO stakes in microSTX
 * @param outcome - The outcome being bet on (YES or NO)
 * @returns Potential winnings in microSTX (includes original stake)
 */
export function calculatePotentialWinnings(
    stake: number,
    totalYes: number,
    totalNo: number,
    outcome: MarketOutcome
): number {
    const totalPool = totalYes + totalNo;

    if (totalPool === 0 || stake === 0) {
        return 0;
    }

    // Determine which side the user is betting on
    const userSideTotal = outcome === MarketOutcome.YES ? totalYes : totalNo;

    if (userSideTotal === 0) {
        // If no one else has bet on this side, user gets entire pool
        return totalPool;
    }

    // Calculate proportional share of the total pool
    const userShare = stake / userSideTotal;
    const winnings = Math.floor(totalPool * userShare);

    return winnings;
}

/**
 * Calculate user's share of the pool
 * @param userStake - User's stake in microSTX
 * @param totalStake - Total stake on the same outcome in microSTX
 * @param poolSize - Total pool size in microSTX
 * @returns User's share amount in microSTX
 */
export function calculateUserShare(
    userStake: number,
    totalStake: number,
    poolSize: number
): number {
    if (totalStake === 0 || userStake === 0) {
        return 0;
    }

    const sharePercentage = userStake / totalStake;
    return Math.floor(poolSize * sharePercentage);
}

/**
 * Format a decimal as a percentage string
 * @param decimal - Decimal value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(decimal: number, decimals: number = 1): string {
    const percentage = decimal * 100;
    return `${percentage.toFixed(decimals)}%`;
}

/**
 * Check if a market is currently active for trading
 * @param endBlock - Market's end block height
 * @param currentBlock - Current block height
 * @returns true if market is active (current block < end block)
 */
export function isMarketActive(endBlock: number, currentBlock: number): boolean {
    return currentBlock < endBlock;
}

/**
 * Check if a market can be resolved
 * @param resolutionBlock - Market's resolution block height
 * @param currentBlock - Current block height
 * @returns true if market can be resolved (current block >= resolution block)
 */
export function canResolveMarket(resolutionBlock: number, currentBlock: number): boolean {
    return currentBlock >= resolutionBlock;
}

/**
 * Calculate the return on investment (ROI) for a winning bet
 * @param stake - Original stake in microSTX
 * @param winnings - Total winnings in microSTX
 * @returns ROI as a decimal (e.g., 0.5 = 50% profit)
 */
export function calculateROI(stake: number, winnings: number): number {
    if (stake === 0) {
        return 0;
    }

    const profit = winnings - stake;
    return profit / stake;
}

/**
 * Calculate blocks remaining until a target block
 * @param targetBlock - Target block height
 * @param currentBlock - Current block height
 * @returns Number of blocks remaining (0 if already passed)
 */
export function blocksRemaining(targetBlock: number, currentBlock: number): number {
    const remaining = targetBlock - currentBlock;
    return Math.max(0, remaining);
}

/**
 * Estimate time remaining in minutes based on blocks
 * @param blocks - Number of blocks
 * @param minutesPerBlock - Minutes per block (default: 10)
 * @returns Estimated minutes
 */
export function blocksToMinutes(blocks: number, minutesPerBlock: number = 10): number {
    return blocks * minutesPerBlock;
}

/**
 * Format time remaining as a human-readable string
 * @param minutes - Total minutes
 * @returns Formatted string (e.g., "2 days, 3 hours")
 */
export function formatTimeRemaining(minutes: number): string {
    if (minutes < 60) {
        return `${Math.round(minutes)} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
    }

    return `${days} day${days !== 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
}
