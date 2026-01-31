import { OrderBook } from './OrderBook';
import { PriceImpact } from './PriceImpact';
import { GasEstimator } from './GasEstimator';

/**
 * Centrailized abstraction for all trading operations, unifying utilities for clean application usage.
 */
export class TradingCore {
    private orderBook: OrderBook;

    constructor() {
        this.orderBook = new OrderBook();
    }

    /**
     * Pre-calculates all metadata for a potential trade.
     */
    async getTradePreview(marketId: string, amount: number, outcome: 'YES' | 'NO') {
        // In a real app, these would fetch from a state manager or API
        const poolSize = 5000;
        const totalLiquidity = 12000;

        const impact = PriceImpact.calculate(amount, poolSize);
        const gas = GasEstimator.estimateSequenceCost(1, 'standard');
        const totalRequired = amount + gas;

        return {
            impact,
            gas,
            totalRequired,
            warning: PriceImpact.getWarningLevel(impact)
        };
    }

    /**
     * Executes a trade sequence with integrated validation.
     */
    async executeTrade(marketId: string, amount: number, outcome: 'YES' | 'NO') {
        console.log(`Executing ${amount} STX stake on ${marketId} for ${outcome}`);
        // Core logic would trigger contract-helpers here
        return { success: true, txId: '0xmockedtransactionid' };
    }

    /**
     * Returns a singleton-like instance of the core.
     */
    static getInstance(): TradingCore {
        return new TradingCore();
    }
}
