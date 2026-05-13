export const BLOCK_HEIGHT_CONFIG = {
    BLOCKS_PER_DAY: 144,
    BLOCKS_PER_HOUR: 6,
    BLOCKS_PER_WEEK: 1008,
    
    DEFAULT_MARKET_DURATION_DAYS: 35,
    DEFAULT_RESOLUTION_BUFFER_DAYS: 3,
    
    MIN_MARKET_DURATION_BLOCKS: 144,
    MAX_MARKET_DURATION_BLOCKS: 43200,
    
    MIN_RESOLUTION_BUFFER_BLOCKS: 72,
    MAX_RESOLUTION_BUFFER_BLOCKS: 1440,
} as const;

export function blocksFromDays(days: number): number {
    return Math.floor(days * BLOCK_HEIGHT_CONFIG.BLOCKS_PER_DAY);
}

export function blocksFromHours(hours: number): number {
    return Math.floor(hours * BLOCK_HEIGHT_CONFIG.BLOCKS_PER_HOUR);
}

export function daysFromBlocks(blocks: number): number {
    return blocks / BLOCK_HEIGHT_CONFIG.BLOCKS_PER_DAY;
}

export function hoursFromBlocks(blocks: number): number {
    return blocks / BLOCK_HEIGHT_CONFIG.BLOCKS_PER_HOUR;
}

export function validateMarketBlocks(
    currentBlock: number,
    endBlock: number,
    resolutionBlock: number
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (endBlock <= currentBlock) {
        errors.push(`End block (${endBlock}) must be in the future (current: ${currentBlock})`);
    }

    if (resolutionBlock <= endBlock) {
        errors.push(`Resolution block (${resolutionBlock}) must be after end block (${endBlock})`);
    }

    const duration = endBlock - currentBlock;
    if (duration < BLOCK_HEIGHT_CONFIG.MIN_MARKET_DURATION_BLOCKS) {
        errors.push(
            `Market duration (${duration} blocks) is too short. ` +
            `Minimum: ${BLOCK_HEIGHT_CONFIG.MIN_MARKET_DURATION_BLOCKS} blocks ` +
            `(${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MIN_MARKET_DURATION_BLOCKS).toFixed(1)} days)`
        );
    }

    if (duration > BLOCK_HEIGHT_CONFIG.MAX_MARKET_DURATION_BLOCKS) {
        errors.push(
            `Market duration (${duration} blocks) is too long. ` +
            `Maximum: ${BLOCK_HEIGHT_CONFIG.MAX_MARKET_DURATION_BLOCKS} blocks ` +
            `(${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MAX_MARKET_DURATION_BLOCKS).toFixed(1)} days)`
        );
    }

    const buffer = resolutionBlock - endBlock;
    if (buffer < BLOCK_HEIGHT_CONFIG.MIN_RESOLUTION_BUFFER_BLOCKS) {
        errors.push(
            `Resolution buffer (${buffer} blocks) is too short. ` +
            `Minimum: ${BLOCK_HEIGHT_CONFIG.MIN_RESOLUTION_BUFFER_BLOCKS} blocks ` +
            `(${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MIN_RESOLUTION_BUFFER_BLOCKS).toFixed(1)} days)`
        );
    }

    if (buffer > BLOCK_HEIGHT_CONFIG.MAX_RESOLUTION_BUFFER_BLOCKS) {
        errors.push(
            `Resolution buffer (${buffer} blocks) is too long. ` +
            `Maximum: ${BLOCK_HEIGHT_CONFIG.MAX_RESOLUTION_BUFFER_BLOCKS} blocks ` +
            `(${daysFromBlocks(BLOCK_HEIGHT_CONFIG.MAX_RESOLUTION_BUFFER_BLOCKS).toFixed(1)} days)`
        );
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function calculateMarketBlocks(
    currentBlock: number,
    durationDays: number = BLOCK_HEIGHT_CONFIG.DEFAULT_MARKET_DURATION_DAYS,
    resolutionBufferDays: number = BLOCK_HEIGHT_CONFIG.DEFAULT_RESOLUTION_BUFFER_DAYS
): { endBlock: number; resolutionBlock: number } {
    const durationBlocks = blocksFromDays(durationDays);
    const bufferBlocks = blocksFromDays(resolutionBufferDays);

    return {
        endBlock: currentBlock + durationBlocks,
        resolutionBlock: currentBlock + durationBlocks + bufferBlocks
    };
}
