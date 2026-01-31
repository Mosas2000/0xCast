/**
 * Utility for parsing and extracting mentions (@user) and market tags (#market) from text.
 */
export class Mentions {
    /**
     * Extracts all unique mentions from a string.
     */
    static extractMentions(text: string): string[] {
        const matches = text.match(/@(\w+)/g) || [];
        return [...new Set(matches.map(m => m.substring(1)))];
    }

    /**
     * Extracts all unique market tags from a string.
     */
    static extractMarketTags(text: string): string[] {
        const matches = text.match(/#(\w+)/g) || [];
        return [...new Set(matches.map(m => m.substring(1).toUpperCase()))];
    }

    /**
     * Wraps mentions and tags in HTML or React-friendly markers for highlighted rendering.
     */
    static wrapForRendering(text: string): string {
        return text
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
            .replace(/#(\w+)/g, '<span class="tag">#$1</span>');
    }

    /**
     * Simulates a notification trigger for each mentioned user.
     */
    static notifyMentioned(mentions: string[], sender: string, contentId: string): void {
        mentions.forEach(user => {
            console.log(`Triggering mention notification: ${sender} mentioned ${user} in ${contentId}`);
        });
    }
}
