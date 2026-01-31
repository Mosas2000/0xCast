/**
 * Utility for generating context-aware OpenGraph and share images for social media.
 */
export class DynamicShareImage {
    private static BASE_OG_URL = 'https://api.0xcast.com/og';

    /**
     * Generates a URL for a dynamic market share image.
     * @param marketTitle Title of the prediction market
     * @param odds Current market odds (0-100)
     * @param theme User's preferred theme
     */
    static getMarketShareUrl(marketTitle: string, odds: number, theme: string = 'glass'): string {
        const params = new URLSearchParams({
            title: marketTitle,
            odds: odds.toString(),
            theme,
            timestamp: Date.now().toString()
        });

        return `${this.BASE_OG_URL}/market?${params.toString()}`;
    }

    /**
     * Generates a URL for a user profile social card.
     * @param username User's display name
     * @param karma Current reputation score
     * @param level Current progression level
     */
    static getProfileShareUrl(username: string, karma: number, level: number): string {
        const params = new URLSearchParams({
            u: username,
            k: karma.toString(),
            l: level.toString(),
            v: '1.0'
        });

        return `${this.BASE_OG_URL}/profile?${params.toString()}`;
    }

    /**
     * Simulates the generation of a high-resolution PNG for direct download.
     */
    static async captureScreenshot(elementId: string): Promise<string> {
        // In a real implementation, this would use html2canvas or a similar library
        console.log(`Capturing DOM element: ${elementId}`);
        return 'data:image/png;base64,...mockeddata...';
    }
}
