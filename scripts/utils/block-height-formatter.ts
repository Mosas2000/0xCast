import { daysFromBlocks, hoursFromBlocks } from './block-height-config.js';

export function formatBlockHeight(height: number): string {
    return height.toLocaleString();
}

export function formatBlockDuration(blocks: number): string {
    const days = Math.floor(daysFromBlocks(blocks));
    const remainingBlocks = blocks - (days * 144);
    const hours = Math.floor(hoursFromBlocks(remainingBlocks));

    if (days > 0 && hours > 0) {
        return `${days}d ${hours}h`;
    } else if (days > 0) {
        return `${days} days`;
    } else if (hours > 0) {
        return `${hours} hours`;
    } else {
        return `${blocks} blocks`;
    }
}

export function formatBlockRange(startBlock: number, endBlock: number): string {
    return `${formatBlockHeight(startBlock)} → ${formatBlockHeight(endBlock)}`;
}

export function formatBlockTimeline(currentBlock: number, endBlock: number, resolutionBlock: number): string {
    const marketDuration = endBlock - currentBlock;
    const resolutionBuffer = resolutionBlock - endBlock;

    return [
        `Current: ${formatBlockHeight(currentBlock)}`,
        `End: ${formatBlockHeight(endBlock)} (in ${formatBlockDuration(marketDuration)})`,
        `Resolution: ${formatBlockHeight(resolutionBlock)} (+${formatBlockDuration(resolutionBuffer)})`
    ].join('\n');
}

export function formatBlockProgress(currentBlock: number, startBlock: number, endBlock: number): string {
    const total = endBlock - startBlock;
    const progress = currentBlock - startBlock;
    const percentage = Math.min(100, Math.max(0, (progress / total) * 100));

    return `${percentage.toFixed(1)}% (${formatBlockHeight(progress)}/${formatBlockHeight(total)} blocks)`;
}

export function estimateBlockTime(targetBlock: number, currentBlock: number, blocksPerMinute: number = 0.1): string {
    const blocksRemaining = targetBlock - currentBlock;
    const minutesRemaining = blocksRemaining / blocksPerMinute;
    const hoursRemaining = minutesRemaining / 60;
    const daysRemaining = hoursRemaining / 24;

    if (daysRemaining >= 1) {
        return `~${Math.ceil(daysRemaining)} days`;
    } else if (hoursRemaining >= 1) {
        return `~${Math.ceil(hoursRemaining)} hours`;
    } else {
        return `~${Math.ceil(minutesRemaining)} minutes`;
    }
}
