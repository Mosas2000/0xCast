/**
 * Utility for sharing markets and activities on Telegram.
 */
export class TelegramShare {
    private static TELEGRAM_SHARE_URL = 'https://t.me/share/url';

    /**
     * Generates a Telegram share link for a specific market.
     */
    static generateMarketLink(marketTitle: string, marketUrl: string): string {
        const text = encodeURIComponent(`Predict the future of "${marketTitle}" on 0xCast!`);
        const url = encodeURIComponent(marketUrl);
        return `${this.TELEGRAM_SHARE_URL}?url=${url}&text=${text}`;
    }

    /**
     * Opens the Telegram sharing intent in a new window.
     */
    static shareMarket(marketTitle: string, marketUrl: string): void {
        const shareUrl = this.generateMarketLink(marketTitle, marketUrl);
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }

    /**
     * Shares a user's victory on Telegram.
     */
    static shareActivity(message: string): void {
        const text = encodeURIComponent(message);
        const shareUrl = `${this.TELEGRAM_SHARE_URL}?text=${text}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
}
