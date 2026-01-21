import { Market } from '../types/market';

/**
 * Generate shareable URL for a market
 * @param marketId - Market ID
 * @returns Full URL to market
 */
export function generateMarketUrl(marketId: number): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/market/${marketId}`;
}

/**
 * Generate pre-filled tweet text for sharing a market
 * @param market - Market to share
 * @returns Tweet text with market question and URL
 */
export function generateTweetText(market: Market): string {
    const url = generateMarketUrl(market.id);
    const question = market.question.length > 100
        ? market.question.substring(0, 97) + '...'
        : market.question;

    return `What do you think? "${question}" 🔮\n\nMake your prediction on @0xCast\n\n${url}`;
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
}
