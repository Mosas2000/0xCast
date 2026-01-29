/**
 * Referral and rewards program utility.
 */
export class ReferralProgram {
    /**
     * Generates a unique referral link for a user.
     */
    static generateLink(address: string): string {
        const baseUrl = window.location.origin;
        const referralCode = btoa(address).substring(0, 10);
        return `${baseUrl}?ref=${referralCode}`;
    }

    /**
     * Parses the referral code from the URL.
     */
    static getReferrerFromURL(): string | null {
        const params = new URLSearchParams(window.location.search);
        return params.get('ref');
    }

    /**
     * Calculates potential rewards for a referral.
     * (Placeholder logic for rewards calculation)
     */
    static estimateReward(volume: number): number {
        const percentage = 0.01; // 1% referral bonus
        return volume * percentage;
    }

    /**
     * Stores the referral code in local storage for attribution.
     */
    static saveAttribution(code: string): void {
        if (code && !localStorage.getItem('0xcast_referrer')) {
            localStorage.setItem('0xcast_referrer', code);
        }
    }
}
