/**
 * Utility for tracking and calculating Profit and Loss (PnL) for individual trades and portfolios.
 */
export class PnLTracker {
    /**
     * Calculates the unrealized PnL for an open position.
     * @param entryPrice Price at which the stake was placed
     * @param currentPrice Current market price of the outcome
     * @param amount Staked amount in STX
     */
    static calculateUnrealizedPnL(entryPrice: number, currentPrice: number, amount: number): number {
        if (entryPrice === 0) return 0;
        const priceChange = currentPrice - entryPrice;
        return Number((priceChange * amount).toFixed(2));
    }

    /**
     * Calculates the ROI percentage for a trade.
     */
    static calculateROI(pnl: number, amount: number): number {
        if (amount === 0) return 0;
        return Number(((pnl / amount) * 100).toFixed(2));
    }

    /**
     * Aggregates total PnL across a list of trades.
     */
    static getTotalPnL(trades: { pnl: number }[]): number {
        return Number(trades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2));
    }

    /**
     * Categorizes trading performance for UI tagging.
     */
    static getPerformanceTier(roi: number): 'LEGENDARY' | 'STABLE' | 'UNDERPERFORMING' | 'RECKLESS' {
        if (roi > 100) return 'LEGENDARY';
        if (roi > 0) return 'STABLE';
        if (roi > -20) return 'UNDERPERFORMING';
        return 'RECKLESS';
    }
}
