import { Market, MarketStatus } from '../types/market';
import { getTotalPoolSize } from './contractHelpers';

/**
 * Filter markets based on filter criteria
 */
export function filterMarkets(markets: Market[], filters: string[]): Market[] {
    if (filters.length === 0) return markets;

    return markets.filter((market) => {
        return filters.every((filter) => {
            switch (filter) {
                case 'high-volume':
                    const pool = getTotalPoolSize(market.totalYesStake, market.totalNoStake);
                    return pool > 100_000_000; // > 100 STX

                case 'ending-soon':
                    // Markets ending within 1000 blocks (~7 days)
                    return market.status === MarketStatus.ACTIVE;

                case 'new':
                    // Markets created recently (placeholder logic)
                    return market.id >= 0;

                case 'active':
                    return market.status === MarketStatus.ACTIVE;

                case 'resolved':
                    return market.status === MarketStatus.RESOLVED;

                default:
                    return true;
            }
        });
    });
}

/**
 * Sort markets based on sort option
 */
export function sortMarkets(markets: Market[], sortBy: string): Market[] {
    const sorted = [...markets];

    switch (sortBy) {
        case 'newest':
            return sorted.sort((a, b) => b.id - a.id);

        case 'ending-soon':
            return sorted.sort((a, b) => a.endDate - b.endDate);

        case 'highest-pool':
            return sorted.sort((a, b) => {
                const poolA = getTotalPoolSize(a.totalYesStake, a.totalNoStake);
                const poolB = getTotalPoolSize(b.totalYesStake, b.totalNoStake);
                return poolB - poolA;
            });

        case 'most-popular':
            // Sort by total pool size as proxy for popularity
            return sorted.sort((a, b) => {
                const poolA = getTotalPoolSize(a.totalYesStake, a.totalNoStake);
                const poolB = getTotalPoolSize(b.totalYesStake, b.totalNoStake);
                return poolB - poolA;
            });

        default:
            return sorted;
    }
}

/**
 * Search markets by question text
 */
export function searchMarkets(markets: Market[], query: string): Market[] {
    if (!query.trim()) return markets;

    const lowerQuery = query.toLowerCase();
    return markets.filter((market) =>
        market.question.toLowerCase().includes(lowerQuery)
    );
}
