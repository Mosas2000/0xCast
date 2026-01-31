/**
 * Utility for generating and validating ecosystem referral links and codes.
 */
export class ReferralLink {
    private static BASE_APP_URL = 'https://0xcast.com';

    /**
     * Generates a unique referral link for a user.
     * @param username User's display name or wallet address
     */
    static generateUrl(username: string): string {
        const code = this.generateCode(username);
        return `${this.BASE_APP_URL}/r/${code}`;
    }

    /**
     * Creates a deterministic short-code from a username.
     */
    static generateCode(username: string): string {
        // Basic base64-like encoding of the string to create a compact code
        const str = username.toLowerCase().trim();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36).toUpperCase();
    }

    /**
     * Validates if a referral code is theoretically valid.
     */
    static isValid(code: string): boolean {
        // Simple length and characters check
        return /^[A-Z0-9]{4,10}$/.test(code);
    }

    /**
     * Simulates parsing a referral code from a URL.
     */
    static parseFromUrl(url: string): string | null {
        const match = url.match(/\/r\/([A-Z0-9]+)/i);
        return match ? match[1].toUpperCase() : null;
    }
}
