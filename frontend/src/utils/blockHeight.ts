// Block height utilities for Stacks blockchain
// Stacks mainnet: ~10 minutes per block

// Approximate current block height (as of Jan 2026)
// Check latest at: https://explorer.hiro.so
const APPROXIMATE_CURRENT_BLOCK = 175000;

// Average block time in milliseconds (10 minutes)
const BLOCK_TIME_MS = 10 * 60 * 1000;

/**
 * Calculate approximate future block height from a date
 * @param futureDate - The target date
 * @param currentBlock - Optional current block height (defaults to approximate)
 * @returns Estimated block height at the future date
 */
export function dateToBlockHeight(
    futureDate: Date,
    currentBlock: number = APPROXIMATE_CURRENT_BLOCK
): number {
    const now = new Date();
    const timeDiff = futureDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
        throw new Error('Future date must be after current time');
    }

    const blocksUntilDate = Math.floor(timeDiff / BLOCK_TIME_MS);
    return currentBlock + blocksUntilDate;
}

/**
 * Calculate approximate date from a block height
 * @param blockHeight - The target block height
 * @param currentBlock - Optional current block height (defaults to approximate)
 * @returns Estimated date at the block height
 */
export function blockHeightToDate(
    blockHeight: number,
    currentBlock: number = APPROXIMATE_CURRENT_BLOCK
): Date {
    const blockDiff = blockHeight - currentBlock;

    if (blockDiff < 0) {
        throw new Error('Block height must be in the future');
    }

    const timeDiff = blockDiff * BLOCK_TIME_MS;
    return new Date(Date.now() + timeDiff);
}

/**
 * Validate that a date is in the future
 * @param date - The date to validate
 * @returns true if date is in the future
 */
export function isFutureDate(date: Date): boolean {
    return date.getTime() > Date.now();
}

/**
 * Get the minimum future block height (current + buffer)
 * @param bufferBlocks - Number of blocks to add as buffer (default: 10 blocks ~100 min)
 * @returns Minimum safe future block height
 */
export function getMinimumFutureBlock(bufferBlocks: number = 10): number {
    return APPROXIMATE_CURRENT_BLOCK + bufferBlocks;
}
