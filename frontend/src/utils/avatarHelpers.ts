/**
 * Generate unique gradient colors from address
 * @param address - Wallet address
 * @returns Array of two hex colors for gradient
 */
export function generateAvatarGradient(address: string): [string, string] {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate two colors from hash
    const color1 = `#${((hash & 0xFFFFFF) | 0x808080).toString(16).padStart(6, '0')}`;
    const color2 = `#${(((hash >> 8) & 0xFFFFFF) | 0x404040).toString(16).padStart(6, '0')}`;

    return [color1, color2];
}

/**
 * Generate geometric pattern from address
 * @param address - Wallet address
 * @returns Pattern type identifier
 */
export function generateAvatarPattern(address: string): 'dots' | 'stripes' | 'grid' | 'waves' {
    const patterns: Array<'dots' | 'stripes' | 'grid' | 'waves'> = ['dots', 'stripes', 'grid', 'waves'];
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return patterns[Math.abs(hash) % patterns.length];
}

/**
 * Shorten address for display
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Shortened address format
 */
export function shortenAddress(address: string, startChars: number = 6, endChars: number = 4): string {
    if (address.length <= startChars + endChars) {
        return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
