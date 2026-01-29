/**
 * Achievement and badges tracking system.
 */
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    criteria: (stats: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_trade',
        title: 'First Blood',
        description: 'Place your first stake in any market.',
        icon: '🎯',
        criteria: (stats) => stats.totalTrades >= 1,
    },
    {
        id: 'winning_streak',
        title: 'On Fire',
        description: 'Win 5 markets in a row.',
        icon: '🔥',
        criteria: (stats) => stats.streak >= 5,
    },
    {
        id: 'whale',
        title: 'Whale Status',
        description: 'Stake over 10,000 STX in total volume.',
        icon: '🐋',
        criteria: (stats) => stats.totalVolume >= 10000,
    },
    {
        id: 'pioneer',
        title: 'Market Pioneer',
        description: 'Create 10 prediction markets.',
        icon: '🚀',
        criteria: (stats) => stats.marketsCreated >= 10,
    },
];

export class AchievementSystem {
    /**
     * Checks for newly unlocked achievements based on current user stats.
     */
    static checkUnlocks(stats: any, unlockedIds: string[]): Achievement[] {
        return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && a.criteria(stats));
    }

    /**
     * Persists an unlocked achievement ID to local storage.
     */
    static saveUnlock(id: string): void {
        const unlocked = this.getUnlocked();
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            localStorage.setItem('0xcast_achievements', JSON.stringify(unlocked));
        }
    }

    /**
     * Retrieves all unlocked achievement IDs.
     */
    static getUnlocked(): string[] {
        const raw = localStorage.getItem('0xcast_achievements');
        return raw ? JSON.parse(raw) : [];
    }
}
