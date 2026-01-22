/**
 * URL helper utilities for generating and parsing URLs
 */

const APP_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://0xcast.xyz';

/**
 * Generate shareable market URL
 * @param marketId - The market ID
 * @returns Full URL to the market
 */
export function generateMarketUrl(marketId: number): string {
    return `${APP_BASE_URL}/market/${marketId}`;
}

/**
 * Parse market ID from URL
 * @returns Market ID if present, null otherwise
 */
export function parseMarketFromUrl(): number | null {
    if (typeof window === 'undefined') return null;
    
    const path = window.location.pathname;
    const match = path.match(/\/market\/(\d+)/);
    
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Generate Stacks Explorer URL
 * @param type - Type of resource ('transaction' or 'address')
 * @param id - Transaction ID or address
 * @returns Explorer URL
 */
export function generateExplorerUrl(type: 'transaction' | 'address', id: string): string {
    const baseUrl = 'https://explorer.stacks.co';
    
    if (type === 'transaction') {
        return `${baseUrl}/txid/${id}?chain=mainnet`;
    } else {
        return `${baseUrl}/address/${id}?chain=mainnet`;
    }
}

/**
 * Format URL for display (remove protocol, truncate if too long)
 * @param url - URL to format
 * @param maxLength - Maximum length before truncation
 * @returns Formatted URL string
 */
export function formatUrl(url: string, maxLength: number = 50): string {
    let formatted = url.replace(/^https?:\/\//, '');
    
    if (formatted.length > maxLength) {
        const half = Math.floor((maxLength - 3) / 2);
        formatted = `${formatted.slice(0, half)}...${formatted.slice(-half)}`;
    }
    
    return formatted;
}

/**
 * Check if URL is valid
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
