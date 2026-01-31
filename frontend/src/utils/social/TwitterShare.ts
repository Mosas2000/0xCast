/**
 * Utility for sharing markets and activities on Twitter/X.
 */
export class TwitterShare {
    private static TWITTER_INTENT_URL = 'https://twitter.com/intent/tweet';

    /**
     * Generates a Twitter share link for a specific market.
     */
    static generateMarketLink(marketTitle: string, marketUrl: string): string {
        const text = encodeURIComponent(`Check out this prediction market on 0xCast: "${marketTitle}"`);
        const url = encodeURIComponent(marketUrl);
        return `${this.TWITTER_INTENT_URL}?text=${text}&url=${url}&via=0xCast&hashtags=Stacks,DeFi`;
    }

    /**
     * Opens the Twitter sharing intent in a new window.
     */
    static shareMarket(marketTitle: string, marketUrl: string): void {
        const shareUrl = this.generateMarketLink(marketTitle, marketUrl);
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }

    /**
     * Shares a user's win on Twitter.
     */
    static shareWin(payout: string, marketTitle: string): void {
        const text = encodeURIComponent(`Just won ${payout} on 0xCast! Predicting the future of "${marketTitle}" was the right move! 🚀`);
        const shareUrl = `${this.TWITTER_INTENT_URL}?text=${text}&via=0xCast&hashtags=Web3,Stacks`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
}
