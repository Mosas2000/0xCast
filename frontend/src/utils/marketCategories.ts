/**
 * Market categories and classification utilities.
 */
export const MarketCategories = {
    CRYPTO: {
        id: 'crypto',
        label: 'Cryptocurrency',
        color: 'text-orange-500',
        icon: '₿',
    },
    POLITICS: {
        id: 'politics',
        label: 'Politics',
        color: 'text-blue-500',
        icon: '🏛️',
    },
    SPORTS: {
        id: 'sports',
        label: 'Sports',
        color: 'text-green-500',
        icon: '⚽',
    },
    ECONOMY: {
        id: 'economy',
        label: 'Economy',
        color: 'text-yellow-500',
        icon: '📈',
    },
    TECH: {
        id: 'tech',
        label: 'Technology',
        color: 'text-purple-500',
        icon: '💻',
    },
} as const;

export type MarketCategory = typeof MarketCategories[keyof typeof MarketCategories];

export class CategoryUtils {
    /**
     * Returns a category by its ID.
     */
    static getById(id: string): MarketCategory | undefined {
        return Object.values(MarketCategories).find(cat => cat.id === id);
    }

    /**
     * Returns all available categories.
     */
    static getAll(): MarketCategory[] {
        return Object.values(MarketCategories);
    }
}
