/**
 * Logic for managing user experience points (XP) and level progression.
 */
export class XPManager {
    private static BASE_XP = 1000;
    private static GROWTH_FACTOR = 1.5;

    /**
     * Calculates the level based on cumulative XP.
     * Formula: level = floor(log_G(XP / BASE)) + 1
     */
    static getLevel(xp: number): number {
        if (xp < this.BASE_XP) return 1;
        return Math.floor(Math.log(xp / this.BASE_XP) / Math.log(this.GROWTH_FACTOR)) + 1;
    }

    /**
     * Calculates XP required for the next level.
     */
    static getXPForNextLevel(currentLevel: number): number {
        return Math.floor(this.BASE_XP * Math.pow(this.GROWTH_FACTOR, currentLevel));
    }

    /**
     * Returns progress percentage towards the next level.
     */
    static getProgress(xp: number): number {
        const currentLevel = this.getLevel(xp);
        const xpAtCurrent = currentLevel === 1 ? 0 : this.getXPForNextLevel(currentLevel - 1);
        const xpAtNext = this.getXPForNextLevel(currentLevel);

        const progress = ((xp - xpAtCurrent) / (xpAtNext - xpAtCurrent)) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    /**
     * Awards XP based on action type.
     */
    static calculateAward(action: 'trade' | 'comment' | 'referral', value: number = 0): number {
        const awards = {
            trade: Math.floor(value * 10), // 10 XP per STX
            comment: 25,
            referral: 500
        };
        return awards[action] || 0;
    }
}
