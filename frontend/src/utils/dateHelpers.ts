/**
 * Format timestamp to human-readable date
 * @param timestamp - Unix timestamp in milliseconds
 * @param format - Format type
 * @returns Formatted date string
 */
export function formatDate(timestamp: number, format: 'short' | 'long' | 'full' = 'short'): string {
    const date = new Date(timestamp);

    switch (format) {
        case 'short':
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'long':
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        case 'full':
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        default:
            return date.toLocaleDateString();
    }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
}

/**
 * Format block height with thousands separator
 * @param block - Block height number
 * @returns Formatted block string
 */
export function formatBlockHeight(block: number): string {
    return `Block #${block.toLocaleString()}`;
}

/**
 * Get estimated time for a future block
 * @param targetBlock - Target block height
 * @param currentBlock - Current block height
 * @param blockTime - Average block time in minutes (default: 10)
 * @returns Estimated time string
 */
export function getBlockEstimatedTime(
    targetBlock: number,
    currentBlock: number,
    blockTime: number = 10
): string {
    const blocksRemaining = targetBlock - currentBlock;
    if (blocksRemaining <= 0) return 'Now';

    const minutesRemaining = blocksRemaining * blockTime;
    const hours = Math.floor(minutesRemaining / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `~${days}d`;
    if (hours > 0) return `~${hours}h`;
    return `~${minutesRemaining}m`;
}
